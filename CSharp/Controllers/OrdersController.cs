using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/orders")]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetOrders()
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var orders = await _context.orders.Where(o => o.user_id == userId).Select(o => new { o.id, o.status, o.curr, o.total, o.created_at }).ToListAsync();
            return Ok(orders);
        }

        [HttpGet("{orderId}/items")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetOrderItems(int orderId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var order = await _context.orders.FirstOrDefaultAsync(o => o.id == orderId);
            if (order == null) return BadRequest(new { message = "Invalid order Id" });
            if (order.user_id != userId) return BadRequest(new { message = "You are not the owner of this order" });

            var orderItems = await _context.order_items
                .Include(oi => oi.Offering).ThenInclude(o => o.Service)
                .Include(oi => oi.Offering).ThenInclude(o => o.Provider).ThenInclude(p => p.User)
                .Where(oi => oi.order_id == orderId)
                .Select(oi => new { oi.id, oi.start_at, oi.end_at, oi.hours, oi.price, oi.total, oi.Offering.title, ServiceName = oi.Offering.Service.name, Provider_name = oi.Offering.Provider.User.name })
                .ToListAsync();
            return Ok(orderItems);
        }

        [HttpPut("{orderId}/cancel")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var order = await _context.orders.FirstOrDefaultAsync(o => o.id == orderId);
            if (order == null) return BadRequest(new { message = "Invalid order Id" });
            if (order.user_id != userId) return BadRequest(new { message = "You are not the owner of this order" });

            order.status = "cancelled";
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }
}
