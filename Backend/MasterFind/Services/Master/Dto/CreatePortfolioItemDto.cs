using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Services.Master.Dtos
{
    public class CreatePortfolioItemDto
    {
        [Required(ErrorMessage = "Açıklama alanı zorunludur.")]
        [MaxLength(500)]
        public string Description { get; set; }

        [Required(ErrorMessage = "Lütfen portfolyo için bir hizmet seçin.")]
        public int ServiceId { get; set; }

        // IFormFile -> ICollection<IFormFile> olarak değiştirildi.
        [Required(ErrorMessage = "Lütfen en az bir resim dosyası yükleyin.")]
        public ICollection<IFormFile> Images { get; set; }
    }
}