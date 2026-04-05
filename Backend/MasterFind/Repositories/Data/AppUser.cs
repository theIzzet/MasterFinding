using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Repositories.Data
{
    public class AppUser:IdentityUser
    {

        public string Name { get; set; } = string.Empty;

        public string SurName { get; set; } = string.Empty;
    }
}
