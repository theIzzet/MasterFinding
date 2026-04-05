using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Master.Dto
{
    public class ServiceCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ICollection<ServiceDto> Services { get; set; } = new List<ServiceDto>();
    }
}
