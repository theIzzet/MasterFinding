
using Microsoft.AspNetCore.Http;
using Services.Master.Dto;
using Services.Master.Dtos;
using Services.Shared.Dtos;

namespace Services.Master
{

    public interface IMasterProfileService
    {
     
        Task<MasterProfileDto?> GetProfileByAppUserIdAsync(string appUserId);

       
        Task<ResultDto> CreateProfileAsync(CreateMasterProfileDto profileDto, string currentUserId);

      
        Task<ResultDto> UpdateProfileAsync(UpdateMasterProfileDto profileDto, string currentUserId);

       
        Task<IEnumerable<MasterProfileDto>> SearchMastersAsync(int? serviceCategoryId, int? locationId);

        Task<IEnumerable<ServiceCategoryDto>> GetAllServiceCategoriesAsync();
        Task<IEnumerable<ServiceDto>> GetAllServiceAsync();
        Task<IEnumerable<ServiceCategoryDto>> GetServiceCategoryWithServicesAsync();
      
        Task<IEnumerable<LocationDto>> GetAllLocationsAsync();

       
        Task<string> SaveFileAsync(IFormFile file, string subfolder);

        Task<ResultDto<PortfolioItemDto>> AddPortfolioItemAsync(string masterUserId, CreatePortfolioItemDto dto);
        Task<ResultDto> UpdatePortfolioItemAsync(int portfolioItemId, string masterUserId, UpdatePortfolioItemDto dto);
        Task<ResultDto> DeletePortfolioItemAsync(int portfolioItemId, string masterUserId);
        Task<IEnumerable<PortfolioItemDto>> GetPortfolioItemsByMasterProfileIdAsync(int masterProfileId);
        Task<PortfolioItemDto> GetPortfolioItemByIdAsync(int portfolioItemId);
        Task<MasterProfileDto?> GetProfileByMasterProfileIdAsync(int masterProfileId);

        Task<IEnumerable<MasterProfileDto>> GetAllProfilesAsync();

        Task<ResultDto> DeleteProfileAsync(int masterProfileId, string currentUserId, bool isAdmin);
    }
}
