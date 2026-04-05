using Services.Master.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Master.Dto
{
   
    public class MasterProfileDto
    {
        public int Id { get; set; }
        public string AppUserId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty; 
                public string SurName { get; set; } = string.Empty; 
        public string PhoneNumber { get; set; } = string.Empty; 
        public string Email { get; set; } = string.Empty;

        public string? CompanyName { get; set; }
        public string Description { get; set; } = string.Empty;
        public int YearsOfExperience { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? CertificateUrl { get; set; }
        public ICollection<ServiceDto> Services { get; set; } = new List<ServiceDto>();
        public ICollection<LocationDto> Locations { get; set; } = new List<LocationDto>();
        public ICollection<PortfolioItemDto> PortfolioItems { get; set; } = new List<PortfolioItemDto>();
    }
}
