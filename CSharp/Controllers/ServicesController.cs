using HomeServicesPlatform.Data;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/services")]
    public class ServicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ServicesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetServices()
        {
            var services = await _context.services
                .Select(s => new
                {
                    service_id = s.id,
                    name = s.name,
                    minRate = s.Offerings.Any()
                        ? s.Offerings.Min(o => o.rate)
                        : -1
                })
                .ToListAsync();

            return Ok(services);
        }
    }

    public struct ServicesListItem
    {
        public int service_id;
        public string name;
        public decimal minRate;
    }
}
