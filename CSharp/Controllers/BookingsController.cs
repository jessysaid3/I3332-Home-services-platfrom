using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/booking")]
    public class BookingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BookingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetBookings()
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var bookings = await _context.bookings
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Order)
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Service)
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Provider).ThenInclude(p => p.User)
                .Include(b => b.Address)
                .Where(b => b.user_id == userId)
                .Select(b => new
                {
                    booking_id = b.id,
                    booking_status = b.status,
                    b.OrderItem.start_at,
                    b.OrderItem.end_at,
                    b.OrderItem.price,
                    b.OrderItem.hours,
                    b.OrderItem.total,
                    b.OrderItem.Order.curr,
                    b.OrderItem.Offering.title,
                    service_name = b.OrderItem.Offering.Service.name,
                    provider_name = b.OrderItem.Offering.Provider.User.name,
                    b.Address.country,
                    b.Address.city,
                    b.Address.street,
                    b.Address.building,
                    b.Address.floor,
                    b.Address.apartment
                })
                .ToListAsync();
            return Ok(bookings);
        }

        [HttpDelete("{bookingId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> CancelBooking(int bookingId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var booking = await _context.bookings.Include(b => b.OrderItem).FirstOrDefaultAsync(b => b.id == bookingId);
            if (booking == null || booking.user_id != userId) return StatusCode(403, new { message = "You are not the owner of this booking" });

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                booking.status = "Cancelled";
                await _context.time_slots.Where(t => t.booking_id == bookingId).ExecuteDeleteAsync();
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { success = true });
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        [HttpGet("pending")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetBookingRequests()
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var provider = await _context.providers.FirstOrDefaultAsync(p => p.user_id == userId);
            if (provider == null) return StatusCode(403, new { message = "You are not a provider" });

            var bookings = await _context.bookings
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Order)
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Service)
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Provider)
                .Include(b => b.User)
                .Include(b => b.Address)
                .Where(b => b.OrderItem.Offering.provider_id == provider.id && b.status == "requested")
                .Select(b => new
                {
                    booking_id = b.id,
                    booking_status = b.status,
                    b.OrderItem.start_at,
                    b.OrderItem.end_at,
                    b.OrderItem.price,
                    b.OrderItem.hours,
                    b.OrderItem.total,
                    b.OrderItem.Order.curr,
                    b.OrderItem.Offering.title,
                    service_name = b.OrderItem.Offering.Service.name,
                    client_name = b.User.name,
                    b.Address.country,
                    b.Address.city,
                    b.Address.street,
                    b.Address.building,
                    b.Address.floor,
                    b.Address.apartment
                })
                .ToListAsync();
            return Ok(bookings);
        }

        [HttpGet("{bookingId}/accept")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> AcceptBooking(int bookingId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var booking = await _context.bookings.Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Provider).FirstOrDefaultAsync(b => b.id == bookingId);
            if (booking == null || booking.OrderItem.Offering.Provider.user_id != userId) return StatusCode(403, new { message = "You are not the Provider for this booking" });

            booking.status = "accepted";
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpGet("{bookingId}/reject")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> RejectBooking(int bookingId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var booking = await _context.bookings.Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Provider).FirstOrDefaultAsync(b => b.id == bookingId);
            if (booking == null || booking.OrderItem.Offering.Provider.user_id != userId) return StatusCode(403, new { message = "You are not the Provider for this booking" });

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                booking.status = "rejected";
                await _context.time_slots.Where(t => t.booking_id == bookingId).ExecuteDeleteAsync();
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { success = true });
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        [HttpGet("provider")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetProviderBookings()
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var provider = await _context.providers.FirstOrDefaultAsync(p => p.user_id == userId);
            if (provider == null) return StatusCode(403, new { message = "You are not a provider" });

            var bookings = await _context.bookings
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Order)
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Service)
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Provider)
                .Include(b => b.User)
                .Include(b => b.Address)
                .Where(b => b.OrderItem.Offering.provider_id == provider.id)
                .OrderByDescending(b => b.id)
                .Select(b => new
                {
                    booking_id = b.id,
                    booking_status = b.status,
                    b.OrderItem.start_at,
                    b.OrderItem.end_at,
                    b.OrderItem.price,
                    b.OrderItem.hours,
                    b.OrderItem.total,
                    b.OrderItem.Order.curr,
                    b.OrderItem.Offering.title,
                    service_name = b.OrderItem.Offering.Service.name,
                    client_name = b.User.name,
                    b.Address.country,
                    b.Address.city,
                    b.Address.street,
                    b.Address.building,
                    b.Address.floor,
                    b.Address.apartment
                })
                .ToListAsync();
            return Ok(bookings);
        }
    }
}
