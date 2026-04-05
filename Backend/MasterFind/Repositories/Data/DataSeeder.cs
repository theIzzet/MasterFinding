using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Repositories.Data
{
    public class DataSeeder
    {
        public static async Task SeedRoles(RoleManager<AppRole> roleManager)
        {
            string[] roles = { "User", "Admin"};
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new AppRole { Name = role });
                }
            }
        }



        public static async Task SeedUsers(UserManager<AppUser> userManager)
        {
            
            if (await userManager.FindByEmailAsync("admin1@sistem.com") == null)
            {
                var admin1 = new AppUser
                {
                    UserName = "admin1",
                    Email = "admin1@sistem.com",
                    Name = "Süper",
                    SurName = "Admin",
                    EmailConfirmed = true,
                    PhoneNumber = "5551112233"
                };

                
                var result = await userManager.CreateAsync(admin1, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin1, "Admin");
                }
            }

          
            if (await userManager.FindByEmailAsync("admin2@sistem.com") == null)
            {
                var admin2 = new AppUser
                {
                    UserName = "admin2",
                    Email = "admin2@sistem.com",
                    Name = "Yedek",
                    SurName = "Yönetici",
                    EmailConfirmed = true,
                    PhoneNumber = "5554445566"
                };

                var result = await userManager.CreateAsync(admin2, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin2, "Admin");
                }
            }
        }
    }
}
