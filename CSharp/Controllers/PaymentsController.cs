using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/payments")]
    public class PaymentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetPayments()
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var payments = await _context.payments.Where(p => _context.orders.Any(o => o.id == p.order_id && o.user_id == userId)).ToListAsync();
            return Ok(payments);
        }

        [HttpPost]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> MakePayment([FromBody] MakePaymentRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            if (request.Info?.order_id == 0 || request.Info?.order_id == null || string.IsNullOrEmpty(request.Info.Method) || string.IsNullOrEmpty(request.Info.Type) || request.Info.Amount == 0 || string.IsNullOrEmpty(request.Info.Curr))
                return BadRequest(new { message = "Fill all required fields" });

            var order = await _context.orders.FirstOrDefaultAsync(o => o.id == request.Info.order_id);
            if (order == null || order.user_id != userId) return BadRequest(new { message = "You are not the owner of this order" });

            var orderItems = await _context.order_items.Include(oi => oi.Offering).ThenInclude(o => o.Provider).Where(oi => oi.order_id == request.Info.order_id).ToListAsync();
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var item in orderItems)
                {
                    var busyTimes = await _context.time_slots.Where(t => t.provider_id == item.Offering.provider_id).ToListAsync();
                    if (busyTimes.Any(bt => Overlaps(item.start_at, item.end_at, bt.start_at, bt.end_at)))
                        return BadRequest(new { message = "Provider is busy during the selected time" });
                }

                if (request.Info.Type == "full" && request.Info.Amount < order.total)
                    return BadRequest(new { message = "Insufficient Amount" });

                _context.payments.Add(new Payment { order_id = request.Info.order_id, method = request.Info.Method, type = request.Info.Type, status = "ok", amount = request.Info.Amount, curr = request.Info.Curr });
                order.status = "paid";
                await _context.SaveChangesAsync();

                var user = await _context.users.Include(u => u.Address).FirstOrDefaultAsync(u => u.id == userId);
                foreach (var item in orderItems)
                {
                    var booking = new Booking { order_item_id = item.id, user_id = userId, addr_id = user!.addr_id ?? 0, status = "requested" };
                    _context.bookings.Add(booking);
                    await _context.SaveChangesAsync();
                    _context.time_slots.Add(new TimeSlot { provider_id = item.Offering.provider_id, booking_id = booking.id, start_at = item.start_at, end_at = item.end_at });
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { success = true });
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        private bool Overlaps(DateTime start1, DateTime end1, DateTime start2, DateTime end2) => start1 < end2 && end1 > start2;
    }

    public class MakePaymentRequest { public PaymentInfo? Info { get; set; } }
    public class PaymentInfo { public int order_id { get; set; } public string Method { get; set; } = string.Empty; public string Type { get; set; } = string.Empty; public decimal Amount { get; set; } public string Curr { get; set; } = string.Empty; }
}
