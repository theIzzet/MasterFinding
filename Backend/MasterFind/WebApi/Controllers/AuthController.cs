using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Services.Auth;
using Services.Auth.Dtos;

[ApiController]
[Route("api/[controller]")]
//[EnableRateLimiting("AuthPolicy")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }


    private void SetJwtCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,    
            Expires = DateTime.UtcNow.AddHours(1), 
            Secure = true,    
            SameSite = SameSiteMode.None, 
           
            Path = "/", 
            IsEssential = true 
        };

        Response.Cookies.Append("jwt", token, cookieOptions);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto);

        if (!result.Success)
            return BadRequest(new { Errors = result.Errors });

        

        SetJwtCookie(result.Token);

        return Ok(new { Message = "Login successful" });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto);

        if (!result.Success)
            return BadRequest(new { Errors = result.Errors });

      
        
        SetJwtCookie(result.Token);

        return StatusCode(StatusCodes.Status201Created, new { Message = "Register successful" });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        

        Response.Cookies.Delete("jwt", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
        });
        return Ok(new { Message = "Logged out" });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();

        return Ok(new
        {
            id = userId,
            roles = roles
        });
    }
}
