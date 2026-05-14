using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/offerings")]
    public class OfferingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OfferingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetOfferings()
        {
            var offers = await _context.offerings
                .Include(o => o.Provider)
                    .ThenInclude(p => p.User)
                .Include(o => o.Provider)
                    .ThenInclude(p => p.Address)
                .Include(o => o.Service)
                .Where(o => o.active)
                .Select(o => new
                {
                    offerId = o.id,
                    providerName = o.Provider.User.name,
                    serviceName = o.Service.name,
                    providerCountry = o.Provider.Address.country,
                    providerCity = o.Provider.Address.city,
                    offerTitle = o.title,
                    hourlyRate = o.rate,
                    currency = o.curr
                })
                .ToListAsync();

            return Ok(offers);
        }

        [HttpPost]
        public async Task<IActionResult> GetOfferingsWithFilters([FromBody] FilterRequest filters)
        {
            var query = _context.offerings
                .Include(o => o.Provider)
                    .ThenInclude(p => p.User)
                .Include(o => o.Provider)
                    .ThenInclude(p => p.Address)
                .Include(o => o.Service)
                .Where(o => o.active && o.Provider.User.role == "provider");

            if (filters.Job != null && filters.Job.Count > 0)
            {
                var jobs = filters.Job.Select(j => j.ToLower()).ToList();
                query = query.Where(o => jobs.Contains(o.Service.name.ToLower()));
            }

            if (filters.Rate != null)
            {
                if (filters.Rate.Min.HasValue)
                {
                    query = query.Where(o => o.rate >= filters.Rate.Min.Value);
                }
                if (filters.Rate.Max.HasValue)
                {
                    query = query.Where(o => o.rate <= filters.Rate.Max.Value);
                }
            }

            if (!string.IsNullOrEmpty(filters.Country))
            {
                query = query.Where(o => o.Provider.Address.country.ToLower() == filters.Country.ToLower());
            }

            if (filters.Cities != null && filters.Cities.Count > 0)
            {
                var cities = filters.Cities.Select(c => c.ToLower()).ToList();
                query = query.Where(o => cities.Contains(o.Provider.Address.city.ToLower()));
            }

            var offers = await query.Select(o => new
            {
                offerId = o.id,
                providerName = o.Provider.User.name,
                serviceName = o.Service.name,
                providerCountry = o.Provider.Address.country,
                providerCity = o.Provider.Address.city,
                offerTitle = o.title,
                hourlyRate = o.rate,
                currency = o.curr
            })
            .ToListAsync();

            return Ok(offers);
        }

        [HttpGet("available-time/{offeringId}")]
        public async Task<IActionResult> GetOfferingAvailableTime(int offeringId)
        {
            var offering = await _context.offerings
                .Include(o => o.Provider)
                .FirstOrDefaultAsync(o => o.id == offeringId);

            if (offering == null)
            {
                return BadRequest(new { message = "No offering Id provided" });
            }

            var busyTimes = await _context.time_slots
                .Where(t => t.provider_id == offering.provider_id)
                .OrderBy(t => t.start_at)
                .Select(t => new
                {
                    start = t.start_at.Ticks,
                    end = t.end_at.Ticks
                })
                .ToListAsync();

            var availableSlots = new List<List<long>>();
            var now = DateTime.Now.Ticks;
            var oneHundredYearsLater = DateTime.Now.AddYears(100).Ticks;

            for (int i = 0; i < busyTimes.Count; i++)
            {
                if (i == 0)
                {
                    if (now < busyTimes[i].start)
                    {
                        availableSlots.Add(new List<long> { new DateTimeOffset(new DateTime(now)).ToUnixTimeMilliseconds(), new DateTimeOffset(new DateTime(busyTimes[i].start)).ToUnixTimeMilliseconds() });
                    }
                }
                else
                {
                    if (now < busyTimes[i - 1].end)
                    {
                        availableSlots.Add(new List<long> { new DateTimeOffset(new DateTime(busyTimes[i - 1].end)).ToUnixTimeMilliseconds(), new DateTimeOffset(new DateTime(busyTimes[i].start)).ToUnixTimeMilliseconds() });
                    }
                    else if (now < busyTimes[i].start)
                    {
                        availableSlots.Add(new List<long> { new DateTimeOffset(new DateTime(now)).ToUnixTimeMilliseconds(), new DateTimeOffset(new DateTime(busyTimes[i].start)).ToUnixTimeMilliseconds() });
                    }
                }
            }

            if (busyTimes.Count > 0 && now < busyTimes[busyTimes.Count - 1].end)
            {
                availableSlots.Add(new List<long> { new DateTimeOffset(new DateTime(busyTimes[busyTimes.Count - 1].end)).ToUnixTimeMilliseconds(), new DateTimeOffset(new DateTime(oneHundredYearsLater)).ToUnixTimeMilliseconds() });
            }
            else
            {
                availableSlots.Add(new List<long> { new DateTimeOffset(new DateTime(now)).ToUnixTimeMilliseconds(), new DateTimeOffset(new DateTime(oneHundredYearsLater)).ToUnixTimeMilliseconds() });
            }

            return Ok(availableSlots);
        }

        [HttpGet("me")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetProviderOffers()
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.providers.FirstOrDefaultAsync(p => p.user_id == userId);
            if (provider == null)
            {
                return Unauthorized(new { message = "You are not a provider" });
            }

            var offers = await _context.offerings
                .Include(o => o.Provider)
                    .ThenInclude(p => p.User)
                .Include(o => o.Provider)
                    .ThenInclude(p => p.Address)
                .Include(o => o.Service)
                .Where(o => o.Provider.user_id == userId)
                .Select(o => new
                {
                    offerId = o.id,
                    providerName = o.Provider.User.name,
                    serviceName = o.Service.name,
                    providerCountry = o.Provider.Address.country,
                    providerCity = o.Provider.Address.city,
                    offerTitle = o.title,
                    hourlyRate = o.rate,
                    currency = o.curr,
                    active = o.active
                })
                .ToListAsync();

            return Ok(offers);
        }

        [HttpPost("me")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> CreateProviderOffer([FromBody] CreateOfferRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.providers.FirstOrDefaultAsync(p => p.user_id == userId);
            if (provider == null)
            {
                return Unauthorized(new { message = "You are not a provider" });
            }

            if (request.Offer.service_id == 0 || request.Offer.service_id == null || string.IsNullOrEmpty(request.Offer.Title) ||
                request.Offer.Rate == null || string.IsNullOrEmpty(request.Offer.Curr) ||
                request.Offer.Active == null)
            {
                return BadRequest(new { message = "Please fill all required fields" });
            }

            var newOffer = new Offering
            {
                provider_id = provider.id,
                service_id = request.Offer.service_id,
                title = request.Offer.Title,
                rate = request.Offer.Rate.Value,
                curr = request.Offer.Curr,
                active = request.Offer.Active.Value
            };

            _context.offerings.Add(newOffer);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, offerId = newOffer.id });
        }

        [HttpPatch("{offeringId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> EditProviderOffer(int offeringId, [FromBody] UpdateOfferRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.providers.FirstOrDefaultAsync(p => p.user_id == userId);
            if (provider == null)
            {
                return Unauthorized(new { message = "You are not a provider" });
            }

            var offering = await _context.offerings
                .Include(o => o.Provider)
                .FirstOrDefaultAsync(o => o.id == offeringId);

            if (offering == null)
            {
                return BadRequest(new { message = "Invalid Offering Id" });
            }

            if (offering.Provider.user_id != userId)
            {
                return Unauthorized(new { message = "You are not the owner of this offering" });
            }

            if (string.IsNullOrEmpty(request.Offer.Title) || request.Offer.Rate == null ||
                string.IsNullOrEmpty(request.Offer.Curr) || request.Offer.Active == null ||
                request.Offer.service_id == 0)
            {
                return BadRequest(new { message = "Please fill all required fields" });
            }

            offering.service_id = request.Offer.service_id;
            offering.title = request.Offer.Title;
            offering.rate = request.Offer.Rate.Value;
            offering.curr = request.Offer.Curr;
            offering.active = request.Offer.Active.Value;

            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        [HttpDelete("{offeringId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> DeleteProviderOffer(int offeringId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.providers.FirstOrDefaultAsync(p => p.user_id == userId);
            if (provider == null)
            {
                return Unauthorized(new { message = "You are not a provider" });
            }

            var offering = await _context.offerings
                .Include(o => o.Provider)
                .FirstOrDefaultAsync(o => o.id == offeringId);

            if (offering == null)
            {
                return BadRequest(new { message = "Invalid Offering Id" });
            }

            if (offering.Provider.user_id != userId)
            {
                return Unauthorized(new { message = "You are not the owner of this offering" });
            }

            _context.offerings.Remove(offering);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
    }

    public class FilterRequest
    {
        public List<string>? Job { get; set; }
        public RateFilter? Rate { get; set; }
        public string? Country { get; set; }
        public List<string>? Cities { get; set; }
    }

    public class RateFilter
    {
        public decimal? Min { get; set; }
        public decimal? Max { get; set; }
    }

    public class CreateOfferRequest
    {
        public OfferDto Offer { get; set; } = new();
    }

    public class UpdateOfferRequest
    {
        public OfferDto Offer { get; set; } = new();
    }

    public class OfferDto
    {
        public int service_id { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal? Rate { get; set; }
        public string Curr { get; set; } = string.Empty;
        public bool? Active { get; set; }
    }
}
