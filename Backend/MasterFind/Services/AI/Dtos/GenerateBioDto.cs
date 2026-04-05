using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.AI.Dtos
{
    public class GenerateBioDto
    {
        public string JobTitle { get; set; }      // Örn: Boya Ustası
        public int ExperienceYears { get; set; }  // Örn: 15
        public string City { get; set; }          // Örn: Ankara
        public string Skills { get; set; }
    }
}
