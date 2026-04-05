using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Master;

namespace WebApi.Controllers
{
    [Route("api/lookups")]
    [ApiController]
    public class LookupsController : ControllerBase
    {
        private readonly IMasterProfileService _masterProfileService;

        public LookupsController(IMasterProfileService masterProfileService)
        {
            _masterProfileService = masterProfileService;
        }

        [HttpGet("service-categories")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllServiceCategories()
        {
            var result = await _masterProfileService.GetAllServiceCategoriesAsync();
            return Ok(result);
        }
        [HttpGet("search")]
        [AllowAnonymous] 
        public async Task<IActionResult> SearchMasters([FromQuery] int? serviceCategoryId, [FromQuery] int? locationId)
        {
            var result = await _masterProfileService.SearchMastersAsync(serviceCategoryId, locationId);
            return Ok(result);
        }

        [HttpGet("services")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllService()
        {
            var result = await _masterProfileService.GetAllServiceAsync();
            return Ok(result);
        }


        [HttpGet("serviceswithcategory")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllServicewithcategory()
        {
            var result = await _masterProfileService.GetServiceCategoryWithServicesAsync();
            return Ok(result);
        }

 
        [HttpGet("locations")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllLocations()
        {
            var result = await _masterProfileService.GetAllLocationsAsync();
            return Ok(result);
        }
    }
}
