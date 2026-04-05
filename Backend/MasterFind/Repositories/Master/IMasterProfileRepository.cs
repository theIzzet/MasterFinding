namespace Repositories.Master
{
    public interface IMasterProfileRepository : IGenericRepository<MasterProfile>
    {
   
        Task<IEnumerable<MasterProfile>> SearchMastersAsync(int? serviceCategoryId, int? locationId);

       
        Task<MasterProfile?> GetByAppUserIdAsync(string appUserId); 
        Task<IEnumerable<ServiceCategory>> GetServiceCategoryWithServicesAsync();
        Task<MasterProfile?> GetByIdWithAllDetailsAsync(int masterProfileId);

        Task<IEnumerable<MasterProfile>> GetAllWithDetailsAsync();
    }
}
