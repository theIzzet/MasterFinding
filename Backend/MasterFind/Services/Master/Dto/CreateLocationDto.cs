using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Admin.Dtos
{
    public class CreateLocationDto
    {
        [Required, MaxLength(50)]
        public string il { get; set; }
        [Required, MaxLength(50)]
        public string ilce { get; set; }
    }
}
