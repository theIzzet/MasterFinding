
using System.ComponentModel.DataAnnotations.Schema;


namespace Repositories.Master
{
   public class PortfolioItem : BaseEntity
    {
        public string Description { get; set; } = string.Empty;

        public int MasterProfileId { get; set; }
        [ForeignKey("MasterProfileId")]
        public virtual MasterProfile MasterProfile { get; set; }

        public int ServiceId { get; set; }
        [ForeignKey("ServiceId")]
        public virtual Service Service { get; set; }

        public virtual ICollection<PortfolioImage> Images { get; set; } = new List<PortfolioImage>();
    }
}
