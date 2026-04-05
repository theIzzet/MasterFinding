// Services/Admin/IAdminService.cs

using Services.Admin.Dtos;
using Services.Master.Dto;
using Services.Shared.Dtos;

namespace Services.Admin
{
    public interface IAdminService
    {
        // --- MEVCUT OLANLAR ---
        Task<ResultDto<ServiceCategoryDto>> CreateServiceCategoryAsync(CreateServiceCategoryDto dto);
        Task<ResultDto<ServiceDto>> CreateServiceAsync(CreateServiceDto dto);
        Task<ResultDto<LocationDto>> CreateLocationAsync(CreateLocationDto dto);

        // --- YENİ EKLENECEKLER (Update & Delete) ---
        Task<ResultDto> DeleteServiceCategoryAsync(int id);
        Task<ResultDto> UpdateServiceCategoryAsync(int id, CreateServiceCategoryDto dto);

        Task<ResultDto> DeleteServiceAsync(int id);
        Task<ResultDto> UpdateServiceAsync(int id, CreateServiceDto dto);

        Task<ResultDto> DeleteLocationAsync(int id);

        // --- KULLANICI YÖNETİMİ ---
        // Tüm kullanıcıları listelemek ve silmek için
        Task<ResultDto> DeleteUserAsync(string userId);

        // Basit bir Dashboard istatistiği
        Task<ResultDto<DashboardStatsDto>> GetDashboardStatsAsync();
    }
}