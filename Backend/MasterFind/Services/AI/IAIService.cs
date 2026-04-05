using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Services.AI.Dtos;

namespace Services.AI
{
    public interface IAIService
    {
        Task<string> GenerateProfileDescriptionAsync(GenerateBioDto dto);
    }
}
