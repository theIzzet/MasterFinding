using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Admin;
using Services.Admin.Dtos;

namespace WebApi.Controllers 
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var result = await _adminService.GetDashboardStatsAsync();
            return Ok(result.Data);
        }

        [HttpPost("service-categories")]
        public async Task<IActionResult> CreateServiceCategory([FromBody] CreateServiceCategoryDto dto)
        {
            var result = await _adminService.CreateServiceCategoryAsync(dto);
            if (!result.Success) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [HttpPut("service-categories/{id}")]
        public async Task<IActionResult> UpdateServiceCategory(int id, [FromBody] CreateServiceCategoryDto dto)
        {
            var result = await _adminService.UpdateServiceCategoryAsync(id, dto);
            if (!result.Success) return BadRequest(result.Errors);
            return Ok(result);
        }

        [HttpDelete("service-categories/{id}")]
        public async Task<IActionResult> DeleteServiceCategory(int id)
        {
            var result = await _adminService.DeleteServiceCategoryAsync(id);
            if (!result.Success) return BadRequest(result.Errors);
            return Ok(result);
        }

        [HttpPost("services")]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
        {
            var result = await _adminService.CreateServiceAsync(dto);
            if (!result.Success) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [HttpPut("services/{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] CreateServiceDto dto)
        {
            var result = await _adminService.UpdateServiceAsync(id, dto);
            if (!result.Success) return BadRequest(result.Errors);
            return Ok(result);
        }

        [HttpDelete("services/{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var result = await _adminService.DeleteServiceAsync(id);
            if (!result.Success) return BadRequest(result.Errors);
            return Ok(result);
        }

        [HttpPost("locations")]
        public async Task<IActionResult> CreateLocation([FromBody] CreateLocationDto dto)
        {
            var result = await _adminService.CreateLocationAsync(dto);
            if (!result.Success) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [HttpDelete("locations/{id}")]
        public async Task<IActionResult> DeleteLocation(int id)
        {
            var result = await _adminService.DeleteLocationAsync(id);
            if (!result.Success) return BadRequest(result.Errors);
            return Ok(result);
        }

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            var result = await _adminService.DeleteUserAsync(userId);
            if (!result.Success) return BadRequest(result.Errors);
            return Ok(result);
        }
    }
}