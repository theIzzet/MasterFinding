using System.Linq.Expressions;
using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Moq;
using Repositories;
using Repositories.Data;
using Repositories.Master;
using Services.Master;
using Services.Master.Dto;
using Services.Master.Dtos;
using Services.Shared.Dtos;
using Xunit;

namespace MasterFind.UnitTests;

/// <summary>
/// Unit tests for MasterProfileService business logic.
/// Dependencies are mocked; no database or HTTP involved.
/// </summary>
public class MasterProfileServiceTests
{
    
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<UserManager<AppUser>> _userManagerMock;
    private readonly Mock<IMasterProfileRepository> _repoMock = new();
    private readonly Mock<IGenericRepository<Service>> _serviceRepoMock = new();
    private readonly Mock<IGenericRepository<Location>> _locationRepoMock = new();
    private readonly Mock<IGenericRepository<PortfolioItem>> _portfolioItemRepoMock = new();
    private readonly Mock<IGenericRepository<PortfolioImage>> _portfolioImageRepoMock = new();
    private readonly Mock<IGenericRepository<ServiceCategory>> _serviceCategoryRepoMock = new();
    private readonly Mock<IMapper> _mapperMock = new();
    private readonly Mock<IWebHostEnvironment> _envMock = new();

    private readonly MasterProfileService _sut;

    public MasterProfileServiceTests()
    {
       
        var store = new Mock<IUserStore<AppUser>>();
        _userManagerMock = new Mock<UserManager<AppUser>>(
            store.Object, null, null, null, null, null, null, null, null);

        
        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
        _envMock.Setup(e => e.WebRootPath).Returns(Path.GetTempPath());

        _sut = new MasterProfileService(
            _uowMock.Object,
            _userManagerMock.Object,
            _repoMock.Object,
            _serviceRepoMock.Object,
            _locationRepoMock.Object,
            _portfolioItemRepoMock.Object,
            _portfolioImageRepoMock.Object,
            _serviceCategoryRepoMock.Object,
            _mapperMock.Object,
            _envMock.Object);
    }

 /// <summary>
 /// Test 1
 /// </summary>
 /// <returns></returns>
    [Fact]
    public async Task CreateProfile_WhenProfileAlreadyExists_ReturnsFail()
    {
        var existingProfile = new MasterProfile
        {
            AppUserId = "user-1",
            AppUser = new AppUser { Id = "user-1", Name = "Test", SurName = "User" }
        };
        _repoMock.Setup(r => r.GetByAppUserIdAsync("user-1"))
                 .ReturnsAsync(existingProfile);

        var dto = new CreateMasterProfileDto { ServiceIds = new List<int>(), LocationIds = new List<int>() };
        var result = await _sut.CreateProfileAsync(dto, "user-1");

        Assert.False(result.Success);
        Assert.Contains(result.Errors, e => e.Contains("zaten bir usta profili"));
    }

    /// <summary>
    /// Test 2 
    /// </summary>
    /// <returns></returns>
    [Fact]
    public async Task CreateProfile_WhenNoExistingProfile_CallsAddAndReturnsSuccess()
    {
        _repoMock.Setup(r => r.GetByAppUserIdAsync("user-2"))
                 .ReturnsAsync((MasterProfile?)null);

        _mapperMock.Setup(m => m.Map<MasterProfile>(It.IsAny<CreateMasterProfileDto>()))
                   .Returns(new MasterProfile
                   {
                       AppUser = new AppUser { Id = "user-2", Name = "Test", SurName = "User" }
                   });

        _serviceRepoMock.Setup(r => r.Where(It.IsAny<Expression<Func<Service, bool>>>()))
                        .Returns(new List<Service>().AsQueryable());
        _locationRepoMock.Setup(r => r.Where(It.IsAny<Expression<Func<Location, bool>>>()))
                         .Returns(new List<Location>().AsQueryable());

        var dto = new CreateMasterProfileDto { ServiceIds = new List<int>(), LocationIds = new List<int>() };
        var result = await _sut.CreateProfileAsync(dto, "user-2");

        Assert.True(result.Success);
        _repoMock.Verify(r => r.AddAsync(It.IsAny<MasterProfile>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    /// <summary>
    /// Test 3
    /// </summary>
    /// <returns></returns>
    [Fact]
    public async Task GetProfileByAppUserId_WhenNotFound_ReturnsNull()
    {
        _repoMock.Setup(r => r.GetByAppUserIdAsync("nobody"))
                 .ReturnsAsync((MasterProfile?)null);

        var result = await _sut.GetProfileByAppUserIdAsync("nobody");

        Assert.Null(result);
    }

   /// <summary>
   /// Test 4
   /// </summary>
   /// <returns></returns>
    [Fact]
    public async Task GetProfileByAppUserId_WhenFound_ReturnsMappedDto()
    {
        var profile = new MasterProfile
        {
            AppUserId = "user-3",
            AppUser = new AppUser { Id = "user-3", Name = "Ali", SurName = "Veli" }
        };
        _repoMock.Setup(r => r.GetByAppUserIdAsync("user-3")).ReturnsAsync(profile);

        var expectedDto = new MasterProfileDto { AppUserId = "user-3" };
        _mapperMock.Setup(m => m.Map<MasterProfileDto>(profile)).Returns(expectedDto);

        var result = await _sut.GetProfileByAppUserIdAsync("user-3");

        Assert.NotNull(result);
        Assert.Equal("user-3", result!.AppUserId);
    }

    /// <summary>
    /// Test 5
    /// </summary>
    /// <returns></returns>
    [Fact]
    public async Task GetAllProfiles_ReturnsMappedList()
    {
        var profiles = new List<MasterProfile>
        {
            new() { AppUser = new AppUser { Name = "A", SurName = "B" } },
            new() { AppUser = new AppUser { Name = "C", SurName = "D" } }
        };
        _repoMock.Setup(r => r.GetAllWithDetailsAsync()).ReturnsAsync(profiles);

        var dtos = new List<MasterProfileDto> { new(), new() };
        _mapperMock.Setup(m => m.Map<IEnumerable<MasterProfileDto>>(profiles)).Returns(dtos);

        var result = await _sut.GetAllProfilesAsync();

        Assert.Equal(2, result.Count());
    }

    /// <summary>
    /// Test 6
    /// </summary>
    /// <returns></returns>
    [Fact]
    public async Task DeleteProfile_WhenProfileNotFound_ReturnsFail()
    {
        _repoMock.Setup(r => r.GetByIdWithAllDetailsAsync(99))
                 .ReturnsAsync((MasterProfile?)null);

        var result = await _sut.DeleteProfileAsync(99, "user-1", false);

        Assert.False(result.Success);
        Assert.Contains(result.Errors, e => e.Contains("bulunamadı"));
    }

    /// <summary>
    /// Test 7
    /// </summary>
    /// <returns></returns>
    [Fact]
    public async Task DeleteProfile_WhenNotOwnerNotAdmin_ReturnsFail()
    {
        var profile = new MasterProfile
        {
            AppUserId = "owner-id",
            AppUser = new AppUser { Id = "owner-id", Name = "Owner", SurName = "User" }
        };
        _repoMock.Setup(r => r.GetByIdWithAllDetailsAsync(1)).ReturnsAsync(profile);

        var result = await _sut.DeleteProfileAsync(1, "other-user", false);

        Assert.False(result.Success);
        Assert.Contains(result.Errors, e => e.Contains("yetki"));
    }

    /// <summary>
    /// Test 8
    /// </summary>
    /// <returns></returns>
    [Fact]
    public async Task DeleteProfile_WhenUserIsOwner_ReturnsSuccess()
    {
        var profile = new MasterProfile
        {
            AppUserId = "owner-id",
            AppUser = new AppUser { Id = "owner-id", Name = "Owner", SurName = "User" }
        };
        _repoMock.Setup(r => r.GetByIdWithAllDetailsAsync(1)).ReturnsAsync(profile);

        var result = await _sut.DeleteProfileAsync(1, "owner-id", false);

        Assert.True(result.Success);
        _repoMock.Verify(r => r.Delete(profile), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    /// <summary>
    /// Test 9
    /// </summary>
    /// <returns></returns>
    [Fact]
    public async Task DeleteProfile_WhenUserIsAdmin_ReturnsSuccess()
    {
        var profile = new MasterProfile
        {
            AppUserId = "some-owner",
            AppUser = new AppUser { Id = "some-owner", Name = "Owner", SurName = "User" }
        };
        _repoMock.Setup(r => r.GetByIdWithAllDetailsAsync(5)).ReturnsAsync(profile);

        var result = await _sut.DeleteProfileAsync(5, "admin-id", isAdmin: true);

        Assert.True(result.Success);
        _repoMock.Verify(r => r.Delete(profile), Times.Once);
    }

    /// <summary>
    /// Test 10
    /// </summary>
    /// <returns></returns>
    [Fact]
    public async Task UpdateProfile_WhenProfileNotFound_ReturnsFail()
    {
        _repoMock.Setup(r => r.GetByAppUserIdAsync("nobody"))
                 .ReturnsAsync((MasterProfile?)null);

        var dto = new UpdateMasterProfileDto { ServiceIds = new List<int>(), LocationIds = new List<int>() };
        var result = await _sut.UpdateProfileAsync(dto, "nobody");

        Assert.False(result.Success);
        Assert.Contains(result.Errors, e => e.Contains("bulunamadı"));
    }

    /// <summary>
    /// Test 11
    /// </summary>
    /// <returns></returns>
    [Fact]
    public async Task UpdateProfile_WhenProfileFound_CallsUpdateAndReturnsSuccess()
    {
        var profile = new MasterProfile
        {
            AppUserId = "user-4",
            AppUser = new AppUser { Id = "user-4", Name = "Test", SurName = "User" }
        };
        _repoMock.Setup(r => r.GetByAppUserIdAsync("user-4")).ReturnsAsync(profile);

        _serviceRepoMock.Setup(r => r.Where(It.IsAny<Expression<Func<Service, bool>>>()))
                        .Returns(new List<Service>().AsQueryable());
        _locationRepoMock.Setup(r => r.Where(It.IsAny<Expression<Func<Location, bool>>>()))
                         .Returns(new List<Location>().AsQueryable());

        _mapperMock.Setup(m => m.Map(It.IsAny<UpdateMasterProfileDto>(), profile));

        var dto = new UpdateMasterProfileDto { ServiceIds = new List<int>(), LocationIds = new List<int>() };
        var result = await _sut.UpdateProfileAsync(dto, "user-4");

        Assert.True(result.Success);
        _repoMock.Verify(r => r.Update(profile), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    /// <summary>
    /// Test 12
    /// </summary>
    /// <returns></returns>
    [Fact]
    public async Task GetProfileByMasterProfileId_WhenNotFound_ReturnsNull()
    {
        _repoMock.Setup(r => r.GetByIdWithAllDetailsAsync(42))
                 .ReturnsAsync((MasterProfile?)null);

        var result = await _sut.GetProfileByMasterProfileIdAsync(42);

        Assert.Null(result);
    }

    /// <summary>
    /// Test13 
    /// </summary>
    /// <returns></returns>
    [Fact]
    public async Task GetProfileByMasterProfileId_WhenFound_ReturnsMappedDto()
    {
        var profile = new MasterProfile
        {
            AppUserId = "user-5",
            AppUser = new AppUser { Id = "user-5", Name = "Test", SurName = "User" }
        };
        _repoMock.Setup(r => r.GetByIdWithAllDetailsAsync(7)).ReturnsAsync(profile);

        var dto = new MasterProfileDto { AppUserId = "user-5" };
        _mapperMock.Setup(m => m.Map<MasterProfileDto>(profile)).Returns(dto);

        var result = await _sut.GetProfileByMasterProfileIdAsync(7);

        Assert.NotNull(result);
        Assert.Equal("user-5", result!.AppUserId);
    }
}
