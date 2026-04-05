

namespace Repositories.Master
{
    public class Location:BaseEntity
    {
        public string il { get; set; } = string.Empty; 
        public string ilce { get; set; } = string.Empty; 

        public virtual ICollection<MasterProfile> MasterProfiles { get; set; } = new List<MasterProfile>();

    }
}
