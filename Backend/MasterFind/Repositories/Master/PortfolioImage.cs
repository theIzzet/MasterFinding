using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Master
{
    public class PortfolioImage : BaseEntity
    {
        public string ImageUrl { get; set; }

        public int PortfolioItemId { get; set; }
        [ForeignKey("PortfolioItemId")]
        public virtual PortfolioItem PortfolioItem { get; set; }
    }
}
