using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/reviews")]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetReviewByBookingId(int bookingId)
        {
            var review = await _context.reviews.Where(r => r.booking_id == bookingId).Select(r => new { r.id, r.booking_id, r.user_id, r.rating, r.note, r.created_at }).FirstOrDefaultAsync();
            if (review == null) return NotFound(new { message = "Review not found" });
            return Ok(review);
        }

        [HttpGet("provider/{providerId}")]
        public async Task<IActionResult> ListReviewsForProvider(int providerId)
        {
            var reviews = await _context.reviews
                .Join(_context.bookings, r => r.booking_id, b => b.id, (r, b) => new { r, b })
                .Join(_context.order_items, rb => rb.b.order_item_id, oi => oi.id, (rb, oi) => new { rb.r, rb.b, oi })
                .Join(_context.offerings, rbo => rbo.oi.offering_id, o => o.id, (rbo, o) => new { rbo.r, rbo.b, rbo.oi, o })
                .Join(_context.providers, rboo => rboo.o.provider_id, p => p.id, (rboo, p) => new { rboo.r, rboo.b, rboo.oi, rboo.o, p })
                .Join(_context.users, rboop => rboop.r.user_id, u => u.id, (rboop, u) => new { rboop.r, rboop.b, rboop.oi, rboop.o, rboop.p, u })
                .Where(x => x.p.id == providerId)
                .OrderByDescending(x => x.r.created_at)
                .Select(x => new { x.r.id, x.r.booking_id, x.r.user_id, UserName = x.u.name, x.r.rating, x.r.note, x.r.created_at })
                .ToListAsync();
            return Ok(reviews);
        }

        [HttpGet("offering/{offeringId}")]
        public async Task<IActionResult> ListReviewsForOffering(int offeringId)
        {
            var reviews = await _context.reviews
                .Join(_context.bookings, r => r.booking_id, b => b.id, (r, b) => new { r, b })
                .Join(_context.order_items, rb => rb.b.order_item_id, oi => oi.id, (rb, oi) => new { rb.r, rb.b, oi })
                .Join(_context.users, rbo => rbo.r.user_id, u => u.id, (rbo, u) => new { rbo.r, rbo.b, rbo.oi, u })
                .Where(x => x.oi.offering_id == offeringId)
                .OrderByDescending(x => x.r.created_at)
                .Select(x => new { x.r.id, x.r.booking_id, x.r.user_id, UserName = x.u.name, x.r.rating, x.r.note, x.r.created_at })
                .ToListAsync();
            return Ok(reviews);
        }

        [HttpPost]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            if (request.booking_id == 0 || request.rating == 0) return BadRequest(new { message = "booking_id and rating are required" });
            if (request.rating < 1 || request.rating > 5) return BadRequest(new { message = "rating must be between 1 and 5" });
            if (request.Note != null && request.Note.Length > 1000) return BadRequest(new { message = "note is too long (max 1000 chars)" });

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var booking = await _context.bookings.Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Provider).FirstOrDefaultAsync(b => b.id == request.booking_id);
                if (booking == null) return NotFound(new { message = "Booking not found" });
                if (booking.user_id != userId) return StatusCode(403, new { message = "You can only review your own booking" });

                var existing = await _context.reviews.AnyAsync(r => r.booking_id == request.booking_id);
                if (existing) return Conflict(new { message = "Booking already reviewed" });

                var review = new Review { booking_id = request.booking_id, user_id = userId, rating = request.rating, note = request.Note };
                _context.reviews.Add(review);
                await _context.SaveChangesAsync();

                var provider = booking.OrderItem.Offering.Provider;
                provider.rating_count++;
                provider.rating_avg = ((provider.rating_avg * (provider.rating_count - 1)) + request.rating) / provider.rating_count;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { bookingId = request.booking_id });
            }
            catch { await transaction.RollbackAsync(); throw; }
        }
    }

    public class CreateReviewRequest { public int booking_id { get; set; } public int rating { get; set; } public string? Note { get; set; } }
}
