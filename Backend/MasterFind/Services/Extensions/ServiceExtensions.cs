using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Services.Admin;
using Services.AI;
using Services.Auth;
using Services.Master;

namespace Services.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddServices(this IServiceCollection services, IConfiguration configuration)
        {

            services.Configure<JwtSettings>(configuration.GetSection("JWT"));

            services.AddAutoMapper(Assembly.GetExecutingAssembly());

            services.AddScoped<JwtService>(); 
            services.AddScoped<IAdminService, AdminService>();
            services.AddScoped<IMasterProfileService, MasterProfileService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IAIService, AiService>();

            return services;
        }
    }
}