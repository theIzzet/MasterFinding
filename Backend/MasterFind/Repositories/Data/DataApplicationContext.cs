using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Repositories.Master;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
namespace Repositories.Data
{
    public class DataApplicationContext:IdentityDbContext<AppUser,AppRole,string>
    {
        public DataApplicationContext(DbContextOptions<DataApplicationContext> options) : base(options)
        {
           
        }

        public DbSet<MasterProfile> MasterProfiles => Set<MasterProfile>();
        public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
        public DbSet<Service> Services => Set<Service>();
        public DbSet<Location> Locations => Set<Location>();
        public DbSet<PortfolioItem> PortfolioItems => Set<PortfolioItem>();
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}
