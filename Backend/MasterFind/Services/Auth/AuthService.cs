using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Repositories.Data;
using Services.Auth.Dtos;

namespace Services.Auth
{
    public class AuthService:IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly JwtService _jwtService;

        public AuthService(
            UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager,
            JwtService jwtService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtService = jwtService;
        }

        public async Task<AuthResultDto> LoginAsync(LoginDto loginDto)
        {
            if (string.IsNullOrEmpty(loginDto.Email) && string.IsNullOrEmpty(loginDto.PhoneNumber))
            {
                return new AuthResultDto
                {
                    Success = false,
                    Errors = new[] { "Either email or phone number must be provided." }
                };
            }

            var user = await _userManager.FindByEmailAsync(loginDto.Email);

            if (!string.IsNullOrEmpty(loginDto.Email))
            {
                user = await _userManager.FindByEmailAsync(loginDto.Email);
            }
            // Eğer telefon verilmişse telefon ile bul
            else if (!string.IsNullOrEmpty(loginDto.PhoneNumber))
            {
                user = _userManager.Users.FirstOrDefault(u => u.PhoneNumber == loginDto.PhoneNumber);
            }

            if (user == null)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Errors = new[] { "Invalid credentials" }
                };
            }

            var result = await _signInManager.PasswordSignInAsync(
                user,
                loginDto.Password,
                loginDto.RememberMe,
                false);

            if (!result.Succeeded)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Errors = new[] { "Invalid login attempt" }
                };
            }

            var roles = await _userManager.GetRolesAsync(user);
            return new AuthResultDto
            {
                Success = true,
                Token = _jwtService.GenerateToken(user.Id, user.Email, user.PhoneNumber, roles)
            };
        }

        public async Task<AuthResultDto> RegisterAsync(RegisterDto registerDto)
        {
            if (string.IsNullOrEmpty(registerDto.Email) && string.IsNullOrEmpty(registerDto.PhoneNumber))
            {
                return new AuthResultDto
                {
                    Success = false,
                    Errors = new[] { "Either email or phone number must be provided." }
                };
            }

            
            if (!string.IsNullOrEmpty(registerDto.Email))
            {
                var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
                if (existingUser != null)
                {
                    return new AuthResultDto
                    {
                        Success = false,
                        Errors = new[] { "Email is already in use." }
                    };
                }
            }


            if (!string.IsNullOrEmpty(registerDto.PhoneNumber))
            {
                var existingUser = _userManager.Users.FirstOrDefault(u => u.PhoneNumber == registerDto.PhoneNumber);
                if (existingUser != null)
                {
                    return new AuthResultDto
                    {
                        Success = false,
                        Errors = new[] { "Phone number is already in use." }
                    };
                }
            }

            if (registerDto.Password != registerDto.ConfirmPassword)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Errors = new[] { "Password and confirmation password do not match." }
                };
            }

            var user = new AppUser
            {
                UserName = registerDto.Username,
                Name=registerDto.Name,
                SurName = registerDto.SurName,
                Email = registerDto.Email,
                PhoneNumber = registerDto.PhoneNumber,
                

            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Errors = result.Errors.Select(e => e.Description)
                };
            }

            await _userManager.AddToRoleAsync(user, "User");
            var roles = await _userManager.GetRolesAsync(user);

            return new AuthResultDto
            {
                Success = true,
                Token = _jwtService.GenerateToken(user.Id, user.Email, user.PhoneNumber, roles)
            };
        }
    }
}
