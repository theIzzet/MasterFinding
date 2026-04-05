using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.AI;
using Services.AI.Dtos;

namespace WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;

        public AIController(IAIService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("generate-bio")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GenerateBio([FromBody] GenerateBioDto dto)
        {
            if (string.IsNullOrEmpty(dto.JobTitle))
                return BadRequest("Lütfen önce hizmet kategorinizi seçin.");

            var result = await _aiService.GenerateProfileDescriptionAsync(dto);
            return Ok(new { description = result });
        }
    }
}
