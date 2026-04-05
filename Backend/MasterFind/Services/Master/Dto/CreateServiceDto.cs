using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Admin.Dtos
{
    public class CreateServiceDto
    {
        [Required, MaxLength(150)]
        public string Name { get; set; }
        [Required]
        public int ServiceCategoryId { get; set; }
    }
}
