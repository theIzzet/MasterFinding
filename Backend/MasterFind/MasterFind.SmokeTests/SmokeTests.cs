using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace MasterFind.SmokeTests;

/// <summary>
/// 10 Smoke Test — uçtan uca HTTP akışını doğrular.
/// Testler TestPriority sırasıyla çalışır; aralarında static state paylaşılır.
/// </summary>
[TestCaseOrderer("MasterFind.SmokeTests.PriorityOrderer", "MasterFind.SmokeTests")]
public class SmokeTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    // Sıralı testler arasında paylaşılan durum
    private static string? _userCookie;
    private static string? _adminCookie;
    private static int _createdProfileId;

    private const string TestUserEmail    = "smoketest@masterfind.com";
    private const string TestUserPassword = "Smoke123!";
    private const string AdminEmail       = "admin1@sistem.com";
    private const string AdminPassword    = "Admin123!";

    public SmokeTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    // Cookie'leri kendimiz yönetiyoruz (HandleCookies = false)
    private HttpClient CreateClient() =>
        _factory.CreateClient(new() { AllowAutoRedirect = false, HandleCookies = false });

    // LoginDto.PhoneNumber = string.Empty (initializer).
    // [Phone] string.Empty'i reddeder; null geçerlidir.
    // Çözüm: LoginDto'daki default değeri null yapan nullable string olarak göndermek.
    private static Task<HttpResponseMessage> PostLoginAsync(HttpClient client, string email, string password)
    {
        // PascalCase ile deniyoruz — PropertyNameCaseInsensitive olmayabilir
        var content = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(new
            {
                Email    = email,
                Password = password,
                PhoneNumber = (string?)null,  // null → [Phone] = true
                RememberMe  = false
            }),
            System.Text.Encoding.UTF8,
            "application/json");
        return client.PostAsync("/api/auth/login", content);
    }

    private static HttpRequestMessage WithCookie(HttpRequestMessage req, string? cookie)
    {
        if (!string.IsNullOrEmpty(cookie))
            req.Headers.Add("Cookie", cookie);
        return req;
    }

    private static string? ExtractJwtCookie(HttpResponseMessage response)
    {
        if (response.Headers.TryGetValues("Set-Cookie", out var cookies))
        {
            var jwt = cookies.FirstOrDefault(c => c.StartsWith("jwt="));
            return jwt?.Split(';')[0]; // "jwt=<token>"
        }
        return null;
    }

    // ──────────────────────────────────────────────────────────
    // Test 1 — Kayıt ol → 201
    // ──────────────────────────────────────────────────────────
    [Fact, TestPriority(1)]
    public async Task T01_Register_Returns201()
    {
        var client = CreateClient();
        var payload = new
        {
            name            = "Smoke",
            surName         = "Test",
            username        = "smoketest",
            email           = TestUserEmail,
            password        = TestUserPassword,
            confirmPassword = TestUserPassword,
            phoneNumber     = "5550001111"
        };

        var response = await client.PostAsJsonAsync("/api/auth/register", payload);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    // ──────────────────────────────────────────────────────────
    // Test 2 — Giriş yap → 200 + cookie oluşumu doğrulanır
    // ──────────────────────────────────────────────────────────
    [Fact, TestPriority(2)]
    public async Task T02_Login_Returns200_And_SetsCookie()
    {
        var client = CreateClient();

        // [Phone] validasyonu string.Empty'i reddeder; null veya valid format gönderilmeli.
        // PhoneNumber login'de sadece kullanıcı bulmak için kullanılır; email varsa önemsiz.
        var userResp = await PostLoginAsync(client, TestUserEmail, TestUserPassword);

        Assert.Equal(HttpStatusCode.OK, userResp.StatusCode);
        _userCookie = ExtractJwtCookie(userResp);
        Assert.NotNull(_userCookie);
        Assert.StartsWith("jwt=", _userCookie);

        // Admin girişi (seeded by DataSeeder.SeedUsers)
        var adminResp = await PostLoginAsync(client, AdminEmail, AdminPassword);

        Assert.Equal(HttpStatusCode.OK, adminResp.StatusCode);
        _adminCookie = ExtractJwtCookie(adminResp);
        Assert.NotNull(_adminCookie);
        Assert.StartsWith("jwt=", _adminCookie);
    }

    // ──────────────────────────────────────────────────────────
    // Test 3 — Auth gerektiren endpoint; cookie olmadan → 401
    // ──────────────────────────────────────────────────────────
    [Fact, TestPriority(3)]
    public async Task T03_AuthRequired_WithoutCookie_Returns401()
    {
        var client   = CreateClient();
        var response = await client.GetAsync("/api/masterprofiles/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ──────────────────────────────────────────────────────────
    // Test 4 — MasterProfile oluştur → 201; id ve zorunlu alan doğrulanır
    // ──────────────────────────────────────────────────────────
    [Fact, TestPriority(4)]
    public async Task T04_CreateProfile_Returns201_IdAndDescriptionPresent()
    {
        var client  = CreateClient();
        var content = new MultipartFormDataContent
        {
            { new StringContent("Test Aciklamasi"),                           "Description"      },
            { new StringContent("5"),                                          "YearsOfExperience"},
            { new StringContent(_factory.SeedServiceId.ToString()),           "ServiceIds[0]"    },
            { new StringContent(_factory.SeedLocationId.ToString()),          "LocationIds[0]"   }
        };

        var createResp = await client.SendAsync(
            WithCookie(new HttpRequestMessage(HttpMethod.Post, "/api/masterprofiles")
            { Content = content }, _userCookie));

        Assert.Equal(HttpStatusCode.Created, createResp.StatusCode);

        // Oluşturulan profilin id'sini al
        var meResp = await client.SendAsync(
            WithCookie(new HttpRequestMessage(HttpMethod.Get, "/api/masterprofiles/me"), _userCookie));

        Assert.Equal(HttpStatusCode.OK, meResp.StatusCode);

        var json    = await meResp.Content.ReadAsStringAsync();
        var profile = JsonDocument.Parse(json).RootElement;

        _createdProfileId = profile.GetProperty("id").GetInt32();
        Assert.True(_createdProfileId > 0);
        Assert.False(string.IsNullOrWhiteSpace(profile.GetProperty("description").GetString()));
    }

    // ──────────────────────────────────────────────────────────
    // Test 5 — Profil listele (admin) → 200; oluşturulan kayıt listede
    // ──────────────────────────────────────────────────────────
    [Fact, TestPriority(5)]
    public async Task T05_ListProfiles_Returns200_ContainsCreatedRecord()
    {
        var client = CreateClient();
        var resp   = await client.SendAsync(
            WithCookie(new HttpRequestMessage(HttpMethod.Get, "/api/masterprofiles"), _adminCookie));

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

        var json     = await resp.Content.ReadAsStringAsync();
        var profiles = JsonDocument.Parse(json).RootElement;

        Assert.Equal(JsonValueKind.Array, profiles.ValueKind);

        var found = profiles.EnumerateArray()
            .Any(p => p.GetProperty("id").GetInt32() == _createdProfileId);

        Assert.True(found, $"id={_createdProfileId} listede bulunamadı");
    }

    // ──────────────────────────────────────────────────────────
    // Test 6 — Tek profil oku → 200
    // ──────────────────────────────────────────────────────────
    [Fact, TestPriority(6)]
    public async Task T06_ReadSingleProfile_Returns200()
    {
        var client = CreateClient();
        var resp   = await client.GetAsync($"/api/masterprofiles/{_createdProfileId}");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

        var json    = await resp.Content.ReadAsStringAsync();
        var profile = JsonDocument.Parse(json).RootElement;
        Assert.Equal(_createdProfileId, profile.GetProperty("id").GetInt32());
    }

    // ──────────────────────────────────────────────────────────
    // Test 7 — Profil güncelle; güncellenen alan gerçekten değişmiş
    // ──────────────────────────────────────────────────────────
    [Fact, TestPriority(7)]
    public async Task T07_UpdateProfile_FieldActuallyChanged()
    {
        const string updated = "Guncellenmis Aciklama";
        var client  = CreateClient();
        var content = new MultipartFormDataContent
        {
            { new StringContent(updated),                                      "Description"      },
            { new StringContent("10"),                                         "YearsOfExperience"},
            { new StringContent(_factory.SeedServiceId.ToString()),           "ServiceIds[0]"    },
            { new StringContent(_factory.SeedLocationId.ToString()),          "LocationIds[0]"   }
        };

        var updateResp = await client.SendAsync(
            WithCookie(new HttpRequestMessage(HttpMethod.Put, "/api/masterprofiles")
            { Content = content }, _userCookie));

        Assert.True(updateResp.IsSuccessStatusCode,
            $"Güncelleme başarısız: {updateResp.StatusCode}");

        // Alanın gerçekten değiştiğini doğrula
        var meResp = await client.SendAsync(
            WithCookie(new HttpRequestMessage(HttpMethod.Get, "/api/masterprofiles/me"), _userCookie));

        var json    = await meResp.Content.ReadAsStringAsync();
        var profile = JsonDocument.Parse(json).RootElement;
        Assert.Equal(updated, profile.GetProperty("description").GetString());
    }

    // ──────────────────────────────────────────────────────────
    // Test 8 — Profil sil → 204; ardından GET → 404
    // ──────────────────────────────────────────────────────────
    [Fact, TestPriority(8)]
    public async Task T08_DeleteProfile_Returns204_ThenGet_Returns404()
    {
        var client = CreateClient();

        var deleteResp = await client.SendAsync(
            WithCookie(
                new HttpRequestMessage(HttpMethod.Delete, $"/api/masterprofiles/{_createdProfileId}"),
                _userCookie));

        Assert.Equal(HttpStatusCode.NoContent, deleteResp.StatusCode);

        // Silinen profil artık 404 dönmeli
        var getResp = await client.GetAsync($"/api/masterprofiles/{_createdProfileId}");
        Assert.Equal(HttpStatusCode.NotFound, getResp.StatusCode);
    }

    // ──────────────────────────────────────────────────────────
    // Test 9 — Geçersiz veriyle istek → 400
    // ──────────────────────────────────────────────────────────
    [Fact, TestPriority(9)]
    public async Task T09_InvalidData_Returns400()
    {
        var client = CreateClient();

        // YearsOfExperience = -1 → [Range(0,60)] ihlali → model validation → 400
        var content = new MultipartFormDataContent
        {
            { new StringContent("Gecerli Aciklama"),  "Description"       },
            { new StringContent("-1"),                 "YearsOfExperience" }
            // ServiceIds ve LocationIds yok → [Required] ihlali de eklenecek
        };

        var resp = await client.SendAsync(
            WithCookie(new HttpRequestMessage(HttpMethod.Post, "/api/masterprofiles")
            { Content = content }, _userCookie));

        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    // ──────────────────────────────────────────────────────────
    // Test 10 — Admin-only endpoint: user → 403, admin → 200
    // ──────────────────────────────────────────────────────────
    [Fact, TestPriority(10)]
    public async Task T10_AdminOnly_UserGets403_AdminGets200()
    {
        var client = CreateClient();

        // Kullanıcı (User rolü) ile istek → 403
        var userResp = await client.SendAsync(
            WithCookie(
                new HttpRequestMessage(HttpMethod.Get, "/api/admin/dashboard-stats"),
                _userCookie));
        Assert.Equal(HttpStatusCode.Forbidden, userResp.StatusCode);

        // Admin ile istek → 200
        var adminResp = await client.SendAsync(
            WithCookie(
                new HttpRequestMessage(HttpMethod.Get, "/api/admin/dashboard-stats"),
                _adminCookie));
        Assert.Equal(HttpStatusCode.OK, adminResp.StatusCode);
    }
}
