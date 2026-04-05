

namespace Repositories.Master
{
    public class ServiceCategory:BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        // Bu kategoriye ait alt hizmetler (Bire-Çok ilişki)
        public virtual ICollection<Service> Services { get; set; } = new List<Service>();
    }
}
