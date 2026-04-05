
using System.ComponentModel.DataAnnotations.Schema;


namespace Repositories.Master
{
    public class Service:BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        // ServiceCategory ile ilişki kurmak için Foreign Key
        public int ServiceCategoryId { get; set; }
        [ForeignKey("ServiceCategoryId")]
        public virtual ServiceCategory ServiceCategory { get; set; }

        // Bu hizmeti veren ustalar (EF Core tarafından yönetilen Çoka-Çok ilişki)
        public virtual ICollection<MasterProfile> MasterProfiles { get; set; } = new List<MasterProfile>();

    }
}
