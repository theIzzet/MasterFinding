using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Repositories;
using Repositories.Data;
using Repositories.Master;
using Services.Master.Dto;
using Services.Master.Dtos;
using Services.Shared;
using Services.Shared.Dtos;

namespace Services.Master
{
    public class MasterProfileService : IMasterProfileService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<AppUser> _userManager;
        private readonly IMasterProfileRepository _masterProfileRepository;
        private readonly IGenericRepository<Service> _serviceRepository;
        private readonly IGenericRepository<Location> _locationRepository;
        private readonly IGenericRepository<PortfolioItem> _portfolioItemRepository; 
        private readonly IGenericRepository<ServiceCategory> _serviceCategoryRepository;
        private readonly IMapper _mapper;
        private readonly IGenericRepository<PortfolioImage> _portfolioImageRepository; 

        private readonly IWebHostEnvironment _webHostEnvironment;
        public MasterProfileService(
            IUnitOfWork unitOfWork,
            UserManager<AppUser> userManager,
            IMasterProfileRepository masterProfileRepository,
            IGenericRepository<Service> serviceRepository,
            IGenericRepository<Location> locationRepository,
            IGenericRepository<PortfolioItem> portfolioItemRepository,
            IGenericRepository<PortfolioImage> portfolioImageRepository, 
            IGenericRepository<ServiceCategory> serviceCategoryRepository,
            IMapper mapper,
            IWebHostEnvironment webHostEnvironment
            
            )
        {
            _unitOfWork = unitOfWork;
            _portfolioItemRepository = portfolioItemRepository; 
            _userManager = userManager;
            _masterProfileRepository = masterProfileRepository;
            _serviceRepository = serviceRepository;
            _locationRepository = locationRepository;
            _portfolioImageRepository = portfolioImageRepository; 
            _serviceCategoryRepository = serviceCategoryRepository;
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<ResultDto> CreateProfileAsync(CreateMasterProfileDto profileDto, string currentUserId)
        {
            var existingProfile = await _masterProfileRepository.GetByAppUserIdAsync(currentUserId);
            if (existingProfile != null)
            {
                return ResultDto.Fail("Bu kullanıcı için zaten bir usta profili mevcut.");
            }

            var newProfile = _mapper.Map<MasterProfile>(profileDto);
            newProfile.AppUserId = currentUserId;
            if (profileDto.ProfileImage != null)
            {
                newProfile.ProfileImageUrl = await SaveFileAsync(profileDto.ProfileImage, "images/masters/profiles");
            }
            if (profileDto.CertificateFile != null)
            {
                newProfile.CertificateUrl = await SaveFileAsync(profileDto.CertificateFile, "documents/masters/certificates");
            }
            var services = _serviceRepository.Where(s => profileDto.ServiceIds.Contains(s.Id)).ToList();
            var locations = _locationRepository.Where(l => profileDto.LocationIds.Contains(l.Id)).ToList();

            newProfile.Services = services;
             newProfile.Locations = locations;

            await _masterProfileRepository.AddAsync(newProfile);
            await _unitOfWork.SaveChangesAsync();

            return ResultDto.Succeed();
        }

        public async Task<ResultDto> UpdateProfileAsync(UpdateMasterProfileDto profileDto, string currentUserId)
        {
            var profileToUpdate = await _masterProfileRepository.GetByAppUserIdAsync(currentUserId);
            if (profileToUpdate == null)
            {
                return ResultDto.Fail("Güncellenecek usta profili bulunamadı.");
            }

            _mapper.Map(profileDto, profileToUpdate);
            if (profileDto.ProfileImage != null)
            {
                profileToUpdate.ProfileImageUrl = await SaveFileAsync(profileDto.ProfileImage, "images/masters/profiles");
            }
            if (profileDto.CertificateFile != null)
            {
                profileToUpdate.CertificateUrl = await SaveFileAsync(profileDto.CertificateFile, "documents/masters/certificates");
            }
            var services = _serviceRepository.Where(s => profileDto.ServiceIds.Contains(s.Id)).ToList();
            var locations = _locationRepository.Where(l => profileDto.LocationIds.Contains(l.Id)).ToList();

            profileToUpdate.Services = services;
            profileToUpdate.Locations = locations;

            _masterProfileRepository.Update(profileToUpdate);
            await _unitOfWork.SaveChangesAsync();

            return ResultDto.Succeed();
        }

        public async Task<MasterProfileDto?> GetProfileByAppUserIdAsync(string appUserId)
        {
            var profile = await _masterProfileRepository.GetByAppUserIdAsync(appUserId);
            if (profile == null) return null;

            return _mapper.Map<MasterProfileDto>(profile);
        }
        public async Task<MasterProfileDto?> GetProfileByMasterProfileIdAsync(int masterProfileId)
        {
            var profile = await _masterProfileRepository.GetByIdWithAllDetailsAsync(masterProfileId);

            if (profile == null)
                return null;

            return _mapper.Map<MasterProfileDto>(profile);
        }
        public async Task<IEnumerable<MasterProfileDto>> SearchMastersAsync(int? serviceCategoryId, int? locationId)
        {
            var profiles = await _masterProfileRepository.SearchMastersAsync(serviceCategoryId, locationId);

            return _mapper.Map<IEnumerable<MasterProfileDto>>(profiles);
        }

        public async Task<IEnumerable<ServiceCategoryDto>> GetAllServiceCategoriesAsync()
        {
            var categories = await _serviceCategoryRepository.GetAllAsync();

            return _mapper.Map<IEnumerable<ServiceCategoryDto>>(categories);
        }
        public async Task<IEnumerable<ServiceDto>> GetAllServiceAsync()
        {
            var categories = await _serviceRepository.GetAllAsync();

            return _mapper.Map<IEnumerable<ServiceDto>>(categories);
        }

        

        public async Task<IEnumerable<ServiceCategoryDto>> GetServiceCategoryWithServicesAsync()
        {
            var categories = await _masterProfileRepository.GetServiceCategoryWithServicesAsync();

            return _mapper.Map<IEnumerable<ServiceCategoryDto>>(categories);
        }
        public async Task<IEnumerable<LocationDto>> GetAllLocationsAsync()
        {
            var locations = await _locationRepository.GetAllAsync();

            return _mapper.Map<IEnumerable<LocationDto>>(locations);
        }
        public void DeleteFile(string relativePath)
        {
            if (string.IsNullOrEmpty(relativePath))
            {
                return; 
            }

            var pathToDelete = relativePath.TrimStart('/');

            var fullPath = Path.Combine(_webHostEnvironment.WebRootPath, pathToDelete);

            if (File.Exists(fullPath))
            {
                try
                {
                    File.Delete(fullPath);
                }
                catch (IOException ex)
                {
                    Console.WriteLine($"Dosya silinirken hata oluştu: {fullPath}, Hata: {ex.Message}");
                }
            }
        }

        public async Task<string> SaveFileAsync(IFormFile file, string subfolder)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("Dosya boş olamaz.");
            }

            string webRootPath = _webHostEnvironment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

            var targetFolder = Path.Combine(webRootPath, subfolder);

            if (!Directory.Exists(targetFolder))
            {
                Directory.CreateDirectory(targetFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(targetFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/{subfolder.Replace("\\", "/")}/{uniqueFileName}";
        }


        public async Task<ResultDto<PortfolioItemDto>> AddPortfolioItemAsync(string masterUserId, CreatePortfolioItemDto dto)
        {
            if (dto == null || dto.Images == null || !dto.Images.Any())
            {
                return ResultDto<PortfolioItemDto>.Fail("Portfolyo oluşturmak için en az bir resim yüklenmelidir. Lütfen dosya seçtiğinizden emin olun.");
            }
            var masterProfile = await _masterProfileRepository.GetByAppUserIdAsync(masterUserId);
            if (masterProfile == null)
                return ResultDto<PortfolioItemDto>.Fail("Usta profili bulunamadı.");

            if (masterProfile.Services == null || !masterProfile.Services.Any(s => s.Id == dto.ServiceId))
                return ResultDto<PortfolioItemDto>.Fail("Portfolyo eklemek istediğiniz hizmet, profilinizde kayıtlı değil veya hizmetleriniz yüklenemedi.");

            var newItem = _mapper.Map<PortfolioItem>(dto);


            if (dto == null || dto.Images == null || !dto.Images.Any())
            {
                return ResultDto<PortfolioItemDto>.Fail("Portfolyo oluşturmak için en az bir resim yüklenmelidir. Lütfen dosya seçtiğinizden emin olun.");
            }


            newItem.MasterProfileId = masterProfile.Id;

            foreach (var imageFile in dto.Images)
            {
                var imageUrl = await SaveFileAsync(imageFile, "images/masters/portfolio");
                if (string.IsNullOrEmpty(imageUrl))
                {
                    return ResultDto<PortfolioItemDto>.Fail("Resim yüklenirken bir hata oluştu.");
                }
                newItem.Images.Add(new PortfolioImage { ImageUrl = imageUrl });
            }

            await _portfolioItemRepository.AddAsync(newItem);
            await _unitOfWork.SaveChangesAsync();


            var createdItem = await _portfolioItemRepository
                .Where(p => p.Id == newItem.Id)
                .Include(p => p.Service)
                .Include(p => p.Images)
                .FirstOrDefaultAsync();

            var resultDto = _mapper.Map<PortfolioItemDto>(createdItem);
            return ResultDto<PortfolioItemDto>.Succeed(resultDto);
        }


        public async Task<ResultDto> UpdatePortfolioItemAsync(int portfolioItemId, string masterUserId, UpdatePortfolioItemDto dto)
        {
            var itemToUpdate = await _portfolioItemRepository.Where(p => p.Id == portfolioItemId).Include(p => p.Images).FirstOrDefaultAsync();
            if (itemToUpdate == null) return ResultDto.Fail("Güncellenecek öğe bulunamadı.");

            var masterProfile = await _masterProfileRepository.GetByAppUserIdAsync(masterUserId);
            if (itemToUpdate.MasterProfileId != masterProfile.Id) return ResultDto.Fail("Bu öğeyi güncelleme yetkiniz yok.");

            itemToUpdate.Description = dto.Description;
            itemToUpdate.ServiceId = dto.ServiceId;

            if (dto.ImageIdsToDelete != null && dto.ImageIdsToDelete.Any())
            {
                var imagesToDelete = itemToUpdate.Images.Where(img => dto.ImageIdsToDelete.Contains(img.Id)).ToList();
                foreach (var image in imagesToDelete)
                {
                    DeleteFile(image.ImageUrl);
                    _portfolioImageRepository.Delete(image);
                }
            }

            if (dto.NewImages != null && dto.NewImages.Any())
            {
                foreach (var imageFile in dto.NewImages)
                {
                    var imageUrl = await SaveFileAsync(imageFile, "portfolio");
                    itemToUpdate.Images.Add(new PortfolioImage { ImageUrl = imageUrl });
                }
            }

            _portfolioItemRepository.Update(itemToUpdate);
            await _unitOfWork.SaveChangesAsync();
            return ResultDto.Succeed();
        }


        public async Task<ResultDto> DeletePortfolioItemAsync(int portfolioItemId, string masterUserId)
        {
            var itemToDelete = await _portfolioItemRepository.Where(p => p.Id == portfolioItemId).Include(p => p.Images).FirstOrDefaultAsync();
            if (itemToDelete == null) return ResultDto.Fail("Silinecek öğe bulunamadı.");

            var masterProfile = await _masterProfileRepository.GetByAppUserIdAsync(masterUserId);
            if (itemToDelete.MasterProfileId != masterProfile.Id) return ResultDto.Fail("Bu öğeyi silme yetkiniz yok.");
            
            foreach (var image in itemToDelete.Images)
            {
                DeleteFile(image.ImageUrl);
            }

            _portfolioItemRepository.Delete(itemToDelete);
            await _unitOfWork.SaveChangesAsync();

            return ResultDto.Succeed();
        }
      
        public async Task<IEnumerable<MasterProfileDto>> GetAllProfilesAsync()
        {
            var profiles = await _masterProfileRepository.GetAllWithDetailsAsync();
            return _mapper.Map<IEnumerable<MasterProfileDto>>(profiles);
        }

        public async Task<ResultDto> DeleteProfileAsync(int masterProfileId, string currentUserId, bool isAdmin)
        {
            var profile = await _masterProfileRepository.GetByIdWithAllDetailsAsync(masterProfileId);
            if (profile == null)
                return ResultDto.Fail("Usta profili bulunamadı.");

            if (!isAdmin && profile.AppUserId != currentUserId)
                return ResultDto.Fail("Bu profili silme yetkiniz yok.");

            if (!string.IsNullOrEmpty(profile.ProfileImageUrl))
                DeleteFile(profile.ProfileImageUrl);

            if (!string.IsNullOrEmpty(profile.CertificateUrl))
                DeleteFile(profile.CertificateUrl);

            foreach (var item in profile.PortfolioItems ?? Enumerable.Empty<PortfolioItem>())
            {
                foreach (var image in item.Images ?? Enumerable.Empty<PortfolioImage>())
                {
                    DeleteFile(image.ImageUrl);
                }
            }

            _masterProfileRepository.Delete(profile);
            await _unitOfWork.SaveChangesAsync();

            return ResultDto.Succeed();
        }

        public async Task<IEnumerable<PortfolioItemDto>> GetPortfolioItemsByMasterProfileIdAsync(int masterProfileId)
        {
            var items = await _portfolioItemRepository.Where(p => p.MasterProfileId == masterProfileId).Include(p => p.Images).Include(p => p.Service).ToListAsync();
            return _mapper.Map<IEnumerable<PortfolioItemDto>>(items);
        }

        public async Task<PortfolioItemDto> GetPortfolioItemByIdAsync(int portfolioItemId)
        {
            var item = await _portfolioItemRepository.Where(p => p.Id == portfolioItemId).Include(p => p.Service).Include(p => p.Images).FirstOrDefaultAsync();
            return _mapper.Map<PortfolioItemDto>(item);
        }

    }
}
