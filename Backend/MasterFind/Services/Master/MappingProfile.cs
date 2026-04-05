using AutoMapper;
using Repositories.Master;
using Services.Admin.Dtos;
using Services.Master.Dto;
using Services.Master.Dtos;
using System.Linq;

namespace Services.Master
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<MasterProfile, MasterProfileDto>()
                .ForMember(d => d.Name, o => o.MapFrom(s => s.AppUser.Name))
                .ForMember(d => d.SurName, o => o.MapFrom(s => s.AppUser.SurName))
                .ForMember(d => d.Email, o => o.MapFrom(s => s.AppUser.Email))
                .ForMember(d => d.PhoneNumber, o => o.MapFrom(s => s.AppUser.PhoneNumber))

                .ForMember(d => d.Services,
                    o => o.MapFrom(s => s.Services
                        .Select(x => new ServiceDto { Id = x.Id, Name = x.Name })))
                .ForMember(d => d.Locations,
                    o => o.MapFrom(s => s.Locations
                        .Select(x => new LocationDto { Id = x.Id, il = x.il, ilce = x.ilce }))) 
                .ForMember(d => d.PortfolioItems,
                    o => o.MapFrom(s => s.PortfolioItems));

            CreateMap<ServiceCategory, ServiceCategoryDto>();
            CreateMap<Service, ServiceDto>().ReverseMap();
            CreateMap<Location, LocationDto>().ReverseMap();

            CreateMap<CreateMasterProfileDto, MasterProfile>()
                .ForMember(d => d.Services, o => o.Ignore())
                .ForMember(d => d.Locations, o => o.Ignore());

            CreateMap<UpdateMasterProfileDto, MasterProfile>()
                .ForMember(d => d.Services, o => o.Ignore())
                .ForMember(d => d.Locations, o => o.Ignore());

            CreateMap<CreateServiceCategoryDto, ServiceCategory>();
            CreateMap<CreateServiceDto, Service>();
            CreateMap<CreateLocationDto, Location>();

            CreateMap<PortfolioItem, PortfolioItemDto>()
                .ForMember(d => d.ServiceName, o => o.MapFrom(s => s.Service.Name))
                .ForMember(d => d.ImageUrls, o => o.MapFrom(s => s.Images.Select(i => i.ImageUrl).ToList()));

            CreateMap<CreatePortfolioItemDto, PortfolioItem>()
                .ForMember(d => d.Images, o => o.Ignore());
        }
    }
}
