using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/profile")]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetProfileInfo()
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var user = await _context.users
                .Include(u => u.Address)
                .Where(u => u.id == userId)
                .Select(u => new
                {
                    u.id,
                    u.name,
                    u.email,
                    u.role,
                    u.status,
                    u.Address!.country,
                    u.Address.city,
                    u.Address.street,
                    u.Address.building,
                    u.Address.floor,
                    u.Address.apartment
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpPatch]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> UpdateProfileInfo([FromBody] UpdateProfileRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            if (request.NewInfo == null)
            {
                return BadRequest(new { message = "no info provided" });
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = await _context.users
                    .Include(u => u.Address)
                    .FirstOrDefaultAsync(u => u.id == userId);

                if (user == null)
                {
                    return NotFound();
                }

                if (!string.IsNullOrEmpty(request.NewInfo.Name))
                {
                    user.name = request.NewInfo.Name;
                }

                if (user.Address != null)
                {
                    if (!string.IsNullOrEmpty(request.NewInfo.Country))
                    {
                        user.Address.country = request.NewInfo.Country;
                    }
                    if (!string.IsNullOrEmpty(request.NewInfo.City))
                    {
                        user.Address.city = request.NewInfo.City;
                    }
                    if (!string.IsNullOrEmpty(request.NewInfo.Street))
                    {
                        user.Address.street = request.NewInfo.Street;
                    }
                    if (!string.IsNullOrEmpty(request.NewInfo.Building))
                    {
                        user.Address.building = request.NewInfo.Building;
                    }
                    if (request.NewInfo.Floor.HasValue && request.NewInfo.Floor.Value > 0)
                    {
                        user.Address.floor = request.NewInfo.Floor.Value;
                    }
                    if (!string.IsNullOrEmpty(request.NewInfo.Apartment))
                    {
                        user.Address.apartment = request.NewInfo.Apartment;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { status = "success" });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    public class UpdateProfileRequest
    {
        public ProfileInfo? NewInfo { get; set; }
    }

    public class ProfileInfo
    {
        public string? Name { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Street { get; set; }
        public string? Building { get; set; }
        public int? Floor { get; set; }
        public string? Apartment { get; set; }
    }
}
