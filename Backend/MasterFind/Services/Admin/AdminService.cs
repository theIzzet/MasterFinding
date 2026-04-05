
using AutoMapper;
using Microsoft.AspNetCore.Identity; 
using Microsoft.EntityFrameworkCore;
using Repositories;
using Repositories.Data; 
using Repositories.Master;
using Services.Admin.Dtos;
using Services.Master.Dto;
using Services.Shared.Dtos;

namespace Services.Admin
{
    public class AdminService : IAdminService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IGenericRepository<ServiceCategory> _serviceCategoryRepository;
        private readonly IGenericRepository<Service> _serviceRepository;
        private readonly IGenericRepository<Location> _locationRepository;

        private readonly UserManager<AppUser> _userManager;
        private readonly IMasterProfileRepository _masterProfileRepository; 

        public AdminService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IGenericRepository<ServiceCategory> serviceCategoryRepository,
            IGenericRepository<Service> serviceRepository,
            IGenericRepository<Location> locationRepository,
            UserManager<AppUser> userManager,
            IMasterProfileRepository masterProfileRepository)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _serviceCategoryRepository = serviceCategoryRepository;
            _serviceRepository = serviceRepository;
            _locationRepository = locationRepository;
            _userManager = userManager;
            _masterProfileRepository = masterProfileRepository;
        }

        public async Task<ResultDto<ServiceCategoryDto>> CreateServiceCategoryAsync(CreateServiceCategoryDto dto)
        {
            var exists = _serviceCategoryRepository.Where(x => x.Name == dto.Name).Any();
            if (exists) return ResultDto<ServiceCategoryDto>.Fail("Bu isimde bir kategori zaten mevcut.");

            var newCategory = new ServiceCategory { Name = dto.Name };
            await _serviceCategoryRepository.AddAsync(newCategory);
            await _unitOfWork.SaveChangesAsync();

            return ResultDto<ServiceCategoryDto>.Succeed(_mapper.Map<ServiceCategoryDto>(newCategory));
        }

        public async Task<ResultDto<ServiceDto>> CreateServiceAsync(CreateServiceDto dto)
        {
            var categoryExists = (await _serviceCategoryRepository.GetByIdAsync(dto.ServiceCategoryId)) != null;
            if (!categoryExists) return ResultDto<ServiceDto>.Fail("Belirtilen hizmet kategorisi bulunamadı.");

            var serviceExists = _serviceRepository.Where(s => s.Name == dto.Name && s.ServiceCategoryId == dto.ServiceCategoryId).Any();
            if (serviceExists) return ResultDto<ServiceDto>.Fail("Bu hizmet, belirtilen kategoride zaten mevcut.");

            var newService = new Service { Name = dto.Name, ServiceCategoryId = dto.ServiceCategoryId };
            await _serviceRepository.AddAsync(newService);
            await _unitOfWork.SaveChangesAsync();

            return ResultDto<ServiceDto>.Succeed(_mapper.Map<ServiceDto>(newService));
        }

        public async Task<ResultDto<LocationDto>> CreateLocationAsync(CreateLocationDto dto)
        {
            var exists = _locationRepository.Where(l => l.il == dto.il && l.ilce == dto.ilce).Any();
            if (exists) return ResultDto<LocationDto>.Fail("Bu il ve ilçe kombinasyonu zaten mevcut.");

            var newLocation = new Location { il = dto.il, ilce = dto.ilce };
            await _locationRepository.AddAsync(newLocation);
            await _unitOfWork.SaveChangesAsync();

            return ResultDto<LocationDto>.Succeed(_mapper.Map<LocationDto>(newLocation));
        }


        public async Task<ResultDto> DeleteServiceCategoryAsync(int id)
        {
            var category = await _serviceCategoryRepository.GetByIdAsync(id);
            if (category == null) return ResultDto.Fail("Kategori bulunamadı.");


            _serviceCategoryRepository.Delete(category);
            await _unitOfWork.SaveChangesAsync();
            return ResultDto.Succeed();
        }

        public async Task<ResultDto> UpdateServiceCategoryAsync(int id, CreateServiceCategoryDto dto)
        {
            var category = await _serviceCategoryRepository.GetByIdAsync(id);
            if (category == null) return ResultDto.Fail("Kategori bulunamadı.");

            category.Name = dto.Name;
            _serviceCategoryRepository.Update(category);
            await _unitOfWork.SaveChangesAsync();
            return ResultDto.Succeed();
        }

        public async Task<ResultDto> DeleteServiceAsync(int id)
        {
            var service = await _serviceRepository.GetByIdAsync(id);
            if (service == null) return ResultDto.Fail("Hizmet bulunamadı.");

            _serviceRepository.Delete(service);
            await _unitOfWork.SaveChangesAsync();
            return ResultDto.Succeed();
        }

        public async Task<ResultDto> UpdateServiceAsync(int id, CreateServiceDto dto)
        {
            var service = await _serviceRepository.GetByIdAsync(id);
            if (service == null) return ResultDto.Fail("Hizmet bulunamadı.");

            service.Name = dto.Name;
            service.ServiceCategoryId = dto.ServiceCategoryId;

            _serviceRepository.Update(service);
            await _unitOfWork.SaveChangesAsync();
            return ResultDto.Succeed();
        }

        public async Task<ResultDto> DeleteLocationAsync(int id)
        {
            var location = await _locationRepository.GetByIdAsync(id);
            if (location == null) return ResultDto.Fail("Konum bulunamadı.");

            _locationRepository.Delete(location);
            await _unitOfWork.SaveChangesAsync();
            return ResultDto.Succeed();
        }


        public async Task<ResultDto> DeleteUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return ResultDto.Fail("Kullanıcı bulunamadı.");

            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
                return ResultDto.Fail(result.Errors.Select(e => e.Description));

            return ResultDto.Succeed();
        }

        public async Task<ResultDto<DashboardStatsDto>> GetDashboardStatsAsync()
        {
            var stats = new DashboardStatsDto
            {
                TotalMasters = await _masterProfileRepository.Where(x => true).CountAsync(),
                TotalUsers = await _userManager.Users.CountAsync(),
                TotalServices = await _serviceRepository.Where(x => true).CountAsync()
            };

            return ResultDto<DashboardStatsDto>.Succeed(stats);
        }
    }
}