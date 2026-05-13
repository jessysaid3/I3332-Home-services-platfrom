using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/cart")]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CartController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetCartItems()
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var cartItems = await _context.cart_items
                .Include(ci => ci.Cart)
                .Include(ci => ci.Offering).ThenInclude(o => o.Service)
                .Include(ci => ci.Offering).ThenInclude(o => o.Provider).ThenInclude(p => p.User)
                .Where(ci => ci.Cart.user_id == userId && ci.Cart.status == "active")
                .Select(ci => new { ci.id, ci.start_at, ci.end_at, ci.hours, ci.Offering.title, ci.Offering.rate, ci.Offering.curr, ServiceName = ci.Offering.Service.name, Provider_name = ci.Offering.Provider.User.name })
                .ToListAsync();

            if (cartItems.Count == 0)
            {
                var cart = await _context.carts.FirstOrDefaultAsync(c => c.user_id == userId && c.status == "active");
                if (cart == null)
                {
                    _context.carts.Add(new Cart { user_id = userId, status = "active" });
                    await _context.SaveChangesAsync();
                }
            }
            return Ok(cartItems);
        }

        [HttpPost]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> AddCartItem([FromBody] AddCartItemRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            if (request.CartItem?.offeringId == 0 || request.CartItem?.start_at == null || request.CartItem?.end_at == null)
                return BadRequest(new { message = "Please fill all required fields" });

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var cart = await _context.carts.FirstOrDefaultAsync(c => c.user_id == userId && c.status == "active");
                if (cart == null)
                {
                    cart = new Cart { user_id = userId, status = "active" };
                    _context.carts.Add(cart);
                    await _context.SaveChangesAsync();
                }

                var offering = await _context.offerings.Include(o => o.Provider).FirstOrDefaultAsync(o => o.id == request.CartItem.offeringId);
                if (offering == null) return BadRequest(new { message = "Offering not found" });

                var busyTimes = await _context.time_slots.Where(t => t.provider_id == offering.provider_id).ToListAsync();
                if (busyTimes.Any(bt => Overlaps(new DateTime(request.CartItem.start_at.Value), new DateTime(request.CartItem.end_at.Value), bt.start_at, bt.end_at)))
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = "Provider is busy during the selected time" });
                }

                var hours = CalculateHours(new DateTime(request.CartItem.start_at.Value), new DateTime(request.CartItem.end_at.Value));
                _context.cart_items.Add(new CartItem { cart_id = cart.id, offering_id = request.CartItem.offeringId, start_at = DateTime.SpecifyKind(DateTimeOffset.FromUnixTimeMilliseconds(request.CartItem.start_at.Value).UtcDateTime, DateTimeKind.Utc), end_at = DateTime.SpecifyKind(DateTimeOffset.FromUnixTimeMilliseconds(request.CartItem.end_at.Value).UtcDateTime, DateTimeKind.Utc), hours = hours });
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { success = true });
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        [HttpPatch("{cartItemId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> EditCartItem(int cartItemId, [FromBody] EditCartItemRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var cartItem = await _context.cart_items.Include(ci => ci.Cart).Include(ci => ci.Offering).ThenInclude(o => o.Provider).FirstOrDefaultAsync(ci => ci.id == cartItemId);
            if (cartItem == null || cartItem.Cart.user_id != userId) return Unauthorized(new { message = "You are not the owner of this item" });

            var busyTimes = await _context.time_slots.Where(t => t.provider_id == cartItem.Offering.provider_id).ToListAsync();
            if (busyTimes.Any(bt => Overlaps(DateTimeOffset.FromUnixTimeMilliseconds(request.CartItem.start_at.Value).UtcDateTime, DateTimeOffset.FromUnixTimeMilliseconds(request.CartItem.end_at.Value).UtcDateTime, bt.start_at, bt.end_at)))
                return BadRequest(new { message = "Provider is busy during the selected time" });

            cartItem.start_at = DateTime.SpecifyKind(DateTimeOffset.FromUnixTimeMilliseconds(request.CartItem.start_at.Value).UtcDateTime, DateTimeKind.Utc);
            cartItem.end_at = DateTime.SpecifyKind(DateTimeOffset.FromUnixTimeMilliseconds(request.CartItem.end_at.Value).UtcDateTime, DateTimeKind.Utc);
            cartItem.hours = CalculateHours(DateTimeOffset.FromUnixTimeMilliseconds(request.CartItem.start_at.Value).UtcDateTime, DateTimeOffset.FromUnixTimeMilliseconds(request.CartItem.end_at.Value).UtcDateTime);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpDelete("{cartItemId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> DeleteCartItem(int cartItemId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var cartItem = await _context.cart_items.Include(ci => ci.Cart).FirstOrDefaultAsync(ci => ci.id == cartItemId);
            if (cartItem == null || cartItem.Cart.user_id != userId) return Unauthorized(new { message = "You are not the owner of this item" });

            _context.cart_items.Remove(cartItem);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpGet("checkout")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> CartCheckout()
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var cartItems = await _context.cart_items.Include(ci => ci.Cart).Include(ci => ci.Offering).Where(ci => ci.Cart.user_id == userId && ci.Cart.status == "active").ToListAsync();
            
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var order = new Order { user_id = userId, status = "pending_payment", total = cartItems.Sum(ci => ci.hours * ci.Offering.rate), curr = "USD" };
                _context.orders.Add(order);
                await _context.SaveChangesAsync();

                foreach (var ci in cartItems)
                {
                    _context.order_items.Add(new OrderItem { order_id = order.id, offering_id = ci.offering_id, start_at = ci.start_at, end_at = ci.end_at, hours = ci.hours, price = ci.Offering.rate, total = ci.hours * ci.Offering.rate });
                }

                var cart = await _context.carts.FirstOrDefaultAsync(c => c.user_id == userId && c.status == "active");
                if (cart != null) cart.status = "checked_out";
                _context.carts.Add(new Cart { user_id = userId, status = "active" });
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { success = true });
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        private decimal CalculateHours(DateTime start, DateTime end) => (decimal)Math.Ceiling((end - start).TotalHours);
        private bool Overlaps(DateTime start1, DateTime end1, DateTime start2, DateTime end2) => start1 < end2 && end1 > start2;
    }

    public class AddCartItemRequest { public CartItemDto? CartItem { get; set; } }
    public class EditCartItemRequest { public CartItemDto? CartItem { get; set; } }
    public class CartItemDto { public int offeringId { get; set; } public long? start_at { get; set; } public long? end_at { get; set; } }
}
