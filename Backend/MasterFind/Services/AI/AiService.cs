using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Services.AI.Dtos;

namespace Services.AI
{
    public class AiService:IAIService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public AiService(IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
        }

        public async Task<string> GenerateProfileDescriptionAsync(GenerateBioDto dto)
        {
            var apiKey = _configuration["AI:OpenRouterApiKey"];
            var model = _configuration["AI:Model"];
            var url = "https://openrouter.ai/api/v1/chat/completions";

            
            var prompt = $@"
                Aşağıdaki bilgilere sahip bir hizmet ustası için müşterilere güven veren, 
                profesyonel ve samimi bir 'Hakkımda' (Biyografi) yazısı yaz.
                Metin Türkçe olsun. Ortalama 3-4 cümle olsun.
                
                Meslek: {dto.JobTitle}
                Tecrübe: {dto.ExperienceYears} yıl
                Şehir: {dto.City}
                Yetenekler: {dto.Skills}
                
                Sadece biyografi metnini döndür, 'İşte metniniz' gibi giriş cümleleri kurma.";

            // Request Body 
            var requestBody = new
            {
                model = model,
                messages = new[]
                {
                    new { role = "user", content = prompt }
                },
                temperature = 0.7 
            };

            var jsonContent = JsonConvert.SerializeObject(requestBody);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            // Header Ayarları
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            
            _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", "https://localhost:7054");
            _httpClient.DefaultRequestHeaders.Add("X-Title", "MasterFind App");

            try
            {
                var response = await _httpClient.PostAsync(url, content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorMsg = await response.Content.ReadAsStringAsync();
                    return $"AI servisi hatası: {response.StatusCode}. Detay: {errorMsg}";
                }

                var responseString = await response.Content.ReadAsStringAsync();
                dynamic result = JsonConvert.DeserializeObject(responseString);

                // OpenRouter/OpenAI response formatından metni çekme
                string generatedText = result.choices[0].message.content;
                return generatedText.Trim().Replace("\"", "");
            }
            catch (Exception ex)
            {
                return $"Bir hata oluştu: {ex.Message}";
            }
        }
    }
}
