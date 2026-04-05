using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Master.Dtos
{
    public class UpdatePortfolioItemDto
    {
        [Required(ErrorMessage = "Açıklama alanı zorunludur.")]
        [MaxLength(500)]
        public string Description { get; set; }

        [Required(ErrorMessage = "Lütfen portfolyo için bir hizmet seçin.")]
        public int ServiceId { get; set; }

        public List<int>? ImageIdsToDelete { get; set; } = new List<int>();

        public ICollection<IFormFile>? NewImages { get; set; }
    }
}