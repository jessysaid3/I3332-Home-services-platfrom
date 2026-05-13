using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HomeServicesPlatform.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HomeServicesPlatform.Middleware
{
    public class AuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public AuthMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task Invoke(HttpContext context, ApplicationDbContext _context)
        {
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            //var test = context.Request.Path;
            
            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length).Trim();
                
                try
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!);
                    
                    tokenHandler.ValidateToken(token, new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = true,
                        ValidIssuer = _configuration["JwtSettings:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = _configuration["JwtSettings:Audience"],
                        ClockSkew = TimeSpan.Zero
                    }, out SecurityToken validatedToken);

                    var jwtToken = (JwtSecurityToken)validatedToken;
                    //var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                    int userId = int.Parse(jwtToken.Claims.FirstOrDefault(c => c.Type.Length > 0).Value);
                    
                    if (userId != null && userId > 0)
                    {
                        var user = _context.users.FirstOrDefault(u => u.id == userId && u.status == "active" && u.Sessions.Any(s => s.expires_at >= DateTime.UtcNow));
                        if (user != null)
                        {
                            context.Items["UserId"] = userId;
                        }
                        else
                        {
                            throw new Exception();
                        }
                        
                    }
                }
                catch
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new { error = "Invalid or expired token" });
                    return;
                }
            }
            
            await _next(context);
        }
    }

    public static class AuthMiddlewareExtensions
    {
        public static IApplicationBuilder UseAuthMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<AuthMiddleware>();
        }
    }
}
