namespace Services.Master.Dtos
{
    public class PortfolioItemDto
    {
        public int Id { get; set; }
        public List<string> ImageUrls { get; set; } = new List<string>();
        public string Description { get; set; }
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
    }
}