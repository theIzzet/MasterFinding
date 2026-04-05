using Microsoft.EntityFrameworkCore;
using Repositories.Data;

namespace Repositories.Master
{
    public class MasterProfileRepository : GenericRepository<MasterProfile>, IMasterProfileRepository
    {
        public MasterProfileRepository(DataApplicationContext context) : base(context)
        {
        }

        public async Task<MasterProfile?> GetByAppUserIdAsync(string appUserId)
        {
            return await _context.MasterProfiles
                .Include(mp => mp.Services)
                .Include(mp => mp.Locations)
                .Include(mp => mp.AppUser)
                .Include(mp => mp.PortfolioItems)
                .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(mp => mp.AppUserId == appUserId);
        }

        public async Task<IEnumerable<MasterProfile>> SearchMastersAsync(int? serviceCategoryId, int? locationId)
        {
            IQueryable<MasterProfile> q = _context.MasterProfiles.AsNoTracking();

            q = q.Include(p => p.AppUser);
            q = q.Include(p => p.Services);
            q = q.Include(p => p.Locations);
            q = q.Include(p => p.PortfolioItems)
                 .ThenInclude(pi => pi.Images);

            if (serviceCategoryId.HasValue)
            {
                q = q.Where(p => p.Services.Any(s => s.ServiceCategoryId == serviceCategoryId.Value));
            }

            if (locationId.HasValue)
            {
                q = q.Where(p => p.Locations.Any(l => l.Id == locationId.Value));
            }

            return await q.ToListAsync();
        }

        public async Task<IEnumerable<ServiceCategory>> GetServiceCategoryWithServicesAsync()
        {
            return await _context.ServiceCategories
                                 .Include(sc => sc.Services)
                                 .ToListAsync();
        }
        public async Task<MasterProfile?> GetByIdWithAllDetailsAsync(int masterProfileId)
        {
            return await _context.MasterProfiles
                .Include(mp => mp.Services)
                .Include(mp => mp.Locations)
                .Include(mp => mp.AppUser)
                .Include(mp => mp.PortfolioItems)
                .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(mp => mp.Id == masterProfileId);
        }

        public async Task<IEnumerable<MasterProfile>> GetAllWithDetailsAsync()
        {
            return await _context.MasterProfiles
                .AsNoTracking()
                .Include(mp => mp.AppUser)
                .Include(mp => mp.Services)
                .Include(mp => mp.Locations)
                .Include(mp => mp.PortfolioItems)
                .ThenInclude(p => p.Images)
                .ToListAsync();
        }
    }
}