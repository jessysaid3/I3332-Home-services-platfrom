using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.users.FirstOrDefaultAsync(u => u.email == request.Email);
            
            if (user == null)
            {
                return Unauthorized(new { error = "Invalid credentials" });
            }

            if (user.status != "active")
            {
                return Unauthorized(new { error = "Your account has been disabled" });
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.pass))
            {
                return Unauthorized(new { error = "Invalid credentials" });
            }

            var token = GenerateJwtToken(user.id);
            
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.sessions.Where(s => s.user_id == user.id).ExecuteDeleteAsync();
                
                var expiresAt = DateTime.UtcNow.AddHours(24);
                var session = new Session
                {
                    user_id = user.id,
                    token = token,
                    is_active = true,
                    expires_at = expiresAt
                };
                
                _context.sessions.Add(session);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return Ok(new { token });
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SignupRequest request)
        {
            if (!string.IsNullOrEmpty(request.AdminPass) && request.AdminPass != _configuration["AdminSettings:Passkey"])
            {
                return BadRequest(new { status = 400, message = "Invalid Admin Password" });
            }

            if (request.Role != "client" && request.Role != "provider" && request.Role != "admin")
            {
                return BadRequest(new { error = "Invalid role" });
            }

            if (request.Role == "provider" && (string.IsNullOrEmpty(request.Address?.Country) || 
                string.IsNullOrEmpty(request.Address.City) || 
                string.IsNullOrEmpty(request.Address.Street) || 
                string.IsNullOrEmpty(request.Address.Building) || 
                request.Address.Floor == null || 
                string.IsNullOrEmpty(request.Address.Apartment) || 
                string.IsNullOrEmpty(request.Bio)))
            {
                return BadRequest(new { status = 400, message = "Please fill all required fields" });
            }

            var existingUser = await _context.users.AnyAsync(u => u.email == request.Email);
            if (existingUser)
            {
                return Conflict(new { error = "Email already exists" });
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                int? addressId = null;
                
                if (request.Address != null && !string.IsNullOrEmpty(request.Address.Country))
                {
                    var address = new Address
                    {
                        country = request.Address.Country,
                        city = request.Address.City,
                        street = request.Address.Street,
                        building = request.Address.Building,
                        floor = request.Address.Floor,
                        apartment = request.Address.Apartment
                    };
                    
                    _context.addresses.Add(address);
                    await _context.SaveChangesAsync();
                    addressId = address.id;
                }

                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
                
                var user = new User
                {
                    email = request.Email,
                    pass = hashedPassword,
                    name = request.Name,
                    role = request.Role,
                    status = "active",
                    addr_id = addressId
                };
                
                _context.users.Add(user);
                await _context.SaveChangesAsync();

                if (request.Role == "provider")
                {
                    var provider = new Provider
                    {
                        user_id = user.id,
                        approved = "pending",
                        bio = request.Bio,
                        addr_id = addressId ?? 0,
                        rating_avg = 0,
                        rating_count = 0
                    };
                    
                    _context.providers.Add(provider);
                    await _context.SaveChangesAsync();
                }

                var token = GenerateJwtToken(user.id);
                
                var session = new Session
                {
                    user_id = user.id,
                    token = token,
                    is_active = true,
                    expires_at = DateTime.UtcNow.AddHours(24)
                };
                
                _context.sessions.Add(session);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return CreatedAtAction(nameof(Login), new { token });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        [HttpPost("logout")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> Logout()
        {
            if (!HttpContext.Items.ContainsKey("UserId"))
            {
                return Unauthorized(new { error = "No token provided" });
            }

            var userId = (int)HttpContext.Items["UserId"]!;
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            var token = authHeader?.Substring("Bearer ".Length).Trim();

            var deleted = await _context.sessions
                .Where(s => s.user_id == userId && s.token == token && s.is_active && s.expires_at >= DateTime.UtcNow)
                .ExecuteDeleteAsync();

            if (deleted == 0)
            {
                return Unauthorized(new { error = "Token expired or invalid" });
            }

            return Ok(new { message = "Success" });
        }

        [HttpPost("refresh")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> Refresh()
        {
            if (!HttpContext.Items.ContainsKey("UserId"))
            {
                return Unauthorized(new { error = "No token provided" });
            }

            var userId = (int)HttpContext.Items["UserId"]!;
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            var token = authHeader?.Substring("Bearer ".Length).Trim();

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var deleted = await _context.sessions
                    .Where(s => s.user_id == userId && s.token == token && s.is_active && s.expires_at >= DateTime.UtcNow)
                    .ExecuteDeleteAsync();

                if (deleted == 0)
                {
                    await transaction.RollbackAsync();
                    return Unauthorized(new { error = "Token expired or invalid" });
                }

                var newToken = GenerateJwtToken(userId);
                
                var session = new Session
                {
                    user_id = userId,
                    token = newToken,
                    is_active = true,
                    expires_at = DateTime.UtcNow.AddHours(24)
                };
                
                _context.sessions.Add(session);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { newToken });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private string GenerateJwtToken(int userId)
        {
            var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userId.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(int.Parse(_configuration["JwtSettings:Expiry"]!.Split(':')[0])),
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class SignupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? AdminPass { get; set; }
        public AddressRequest? Address { get; set; }
    }

    public class AddressRequest
    {
        public string Country { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string Building { get; set; } = string.Empty;
        public int? Floor { get; set; }
        public string Apartment { get; set; } = string.Empty;
    }
}
