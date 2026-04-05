using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Master.Dto
{
    public class CreateMasterProfileDto
    {
        [Required(ErrorMessage = "Açıklama alanı zorunludur.")]
        [MaxLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter olabilir.")]
        public string Description { get; set; } = string.Empty;

        [MaxLength(200, ErrorMessage = "Firma adı en fazla 200 karakter olabilir.")]
        public string? CompanyName { get; set; }

        [Required(ErrorMessage = "Tecrübe yılı zorunludur.")]
        [Range(0, 60, ErrorMessage = "Tecrübe yılı 0 ile 60 arasında olmalıdır.")]
        public int YearsOfExperience { get; set; }

        [MaxLength(20, ErrorMessage = "Vergi numarası en fazla 20 karakter olabilir.")]
        public string? TaxNumber { get; set; }

        public IFormFile? ProfileImage { get; set; }
        public IFormFile? CertificateFile { get; set; }

        [Required(ErrorMessage = "En az bir hizmet seçilmelidir.")]
        public List<int> ServiceIds { get; set; } = new List<int>();

        [Required(ErrorMessage = "En az bir konum seçilmelidir.")]
        public List<int> LocationIds { get; set; } = new List<int>();
    }
}
