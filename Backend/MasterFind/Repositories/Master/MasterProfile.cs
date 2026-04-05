using Repositories.Data;
using System.ComponentModel.DataAnnotations.Schema;

namespace Repositories.Master
{
    public class MasterProfile:BaseEntity
    {
        public string? CompanyName { get; set; } 
        public string Description { get; set; } = string.Empty; 
        public int YearsOfExperience { get; set; } 
        public string? TaxNumber { get; set; } 
        public string? ProfileImageUrl { get; set; } 
        public string? CertificateUrl { get; set; } 

        
        public string AppUserId { get; set; } = string.Empty;
        [ForeignKey("AppUserId")]
        public required virtual AppUser AppUser { get; set; }
        
        public virtual ICollection<PortfolioItem> PortfolioItems { get; set; } = new List<PortfolioItem>();
        
        public virtual ICollection<Service> Services { get; set; } = new List<Service>();
        public virtual ICollection<Location> Locations { get; set; } = new List<Location>();

    }
}
