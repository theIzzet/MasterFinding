using Microsoft.AspNetCore.Hosting;
using Xunit;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Repositories.Data;
using Repositories.Master;

namespace MasterFind.SmokeTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    public int SeedServiceId { get; private set; }
    public int SeedLocationId { get; private set; }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration(config =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Data Source=:memory:",
                
                ["JWT:Secret"] = "smoke-test-super-secret-jwt-key-2024-masterfind",
                ["JWT:ValidIssuer"] = "https://localhost:7054",
                ["JWT:ValidAudience"] = "https://localhost:7054",
                ["JWT:ExpireMinutes"] = "60",
                ["AI:OpenRouterApiKey"] = "test-key",
                ["AI:Model"] = "test-model"
            });
        });

        builder.ConfigureServices(services =>
        {
            
            var dbDescriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(DbContextOptions<DataApplicationContext>));
            if (dbDescriptor != null) services.Remove(dbDescriptor);
            
            var seedDescriptor = services.SingleOrDefault(d =>
                d.ImplementationType == typeof(DataSeedHostedService));
            if (seedDescriptor != null) services.Remove(seedDescriptor);

           
            services.AddDbContext<DataApplicationContext>(options =>
                options.UseSqlite(_connection));
        });
    }

    public async Task InitializeAsync()
    {
       
        await _connection.OpenAsync();

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<DataApplicationContext>();
       
        await db.Database.EnsureCreatedAsync();
      
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<AppRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

        await DataSeeder.SeedRoles(roleManager);
        await DataSeeder.SeedUsers(userManager);

        var category = new ServiceCategory { Name = "Test Kategori" };
        db.ServiceCategories.Add(category);
        await db.SaveChangesAsync();

        var service = new Service { Name = "Test Hizmet", ServiceCategoryId = category.Id };
        db.Services.Add(service);

        var location = new Location { il = "Istanbul", ilce = "Kadikoy" };
        db.Locations.Add(location);

        await db.SaveChangesAsync();

        SeedServiceId = service.Id;
        SeedLocationId = location.Id;
    }

    public new async Task DisposeAsync()
    {
        await base.DisposeAsync();
        await _connection.DisposeAsync();
    }
}
