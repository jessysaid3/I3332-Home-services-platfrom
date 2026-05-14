using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/provider")]
    public class ProviderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProviderController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{providerId}")]
        public async Task<IActionResult> GetProviderDetails(int providerId)
        {
            if (providerId < 0)
            {
                return BadRequest(new { message = "id not provided" });
            }

            var provider = await _context.providers
                .Include(p => p.User)
                .Include(p => p.User.Address)
                .Where(p => p.id == providerId)
                .Select(p => new
                {
                    p.id,
                    Name = p.User.name,
                    p.bio,
                    p.rating_avg,
                    p.rating_count,
                    p.User.Address.country,
                    p.User.Address.city,
                    p.User.Address.street,
                    p.User.Address.building,
                    p.User.Address.floor,
                    p.User.Address.apartment
                })
                .FirstOrDefaultAsync();

            if (provider == null)
            {
                return NotFound(new { message = "Provider not found" });
            }

            return Ok(provider);
        }

        [HttpPost("me/busy-slots")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> CreateBusyTimeSlot([FromBody] CreateTimeSlotRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.providers.FirstOrDefaultAsync(p => p.user_id == userId);
            if (provider == null)
            {
                return StatusCode(403, new { message = "You are not a provider" });
            }

            if (string.IsNullOrEmpty(request.start_at) || string.IsNullOrEmpty(request.end_at))
            {
                return BadRequest(new { message = "start_at and end_at are required valid dates" });
            }

            request.StartAt = DateTimeOffset.Parse(request.start_at).LocalDateTime.ToUniversalTime();
            request.EndAt = DateTimeOffset.Parse(request.end_at).LocalDateTime.ToUniversalTime();

            if (request.StartAt >= request.EndAt)
            {
                return BadRequest(new { message = "start_at must be before end_at" });
            }

            var overlappingSlot = await _context.time_slots
                .AnyAsync(t => t.provider_id == provider.id && t.start_at < request.EndAt && t.end_at > request.StartAt);

            if (overlappingSlot)
            {
                return Conflict(new { message = "Time slot overlaps with an existing slot" });
            }

            var newSlot = new TimeSlot
            {
                provider_id = provider.id,
                start_at = request.StartAt.Value,
                end_at = request.EndAt.Value,
                booking_id = null
            };

            _context.time_slots.Add(newSlot);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                slot = new
                {
                    id = newSlot.id,
                    provider_id = newSlot.provider_id,
                    start_at = newSlot.start_at,
                    end_at = newSlot.end_at,
                    booking_id = newSlot.booking_id
                }
            });
        }

        [HttpDelete("me/busy-slots/{slotId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> DeleteBusyTimeSlot(int slotId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.providers.FirstOrDefaultAsync(p => p.user_id == userId);
            if (provider == null)
            {
                return StatusCode(403, new { message = "You are not a provider" });
            }

            var slot = await _context.time_slots
                .FirstOrDefaultAsync(t => t.id == slotId && t.provider_id == provider.id && t.booking_id == null);

            if (slot == null)
            {
                return NotFound(new { message = "Busy slot not found or cannot be deleted" });
            }

            _context.time_slots.Remove(slot);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                deletedSlotId = slot.id
            });
        }

        [HttpGet("me/busy-slots/manual")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetManualBusySlots()
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.providers.FirstOrDefaultAsync(p => p.user_id == userId);
            if (provider == null)
            {
                return StatusCode(403, new { message = "You are not a provider" });
            }

            var slots = await _context.time_slots
                .Where(t => t.provider_id == provider.id && t.booking_id == null)
                .OrderBy(t => t.start_at)
                .Select(t => new
                {
                    t.id,
                    t.provider_id,
                    t.start_at,
                    t.end_at,
                    t.booking_id
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                slots
            });
        }
    }

    public class CreateTimeSlotRequest
    {
        public string? start_at { get; set; }
        public string? end_at { get; set; }

        public DateTime? StartAt { get; set; }
        public DateTime? EndAt { get; set; }
    }
}
