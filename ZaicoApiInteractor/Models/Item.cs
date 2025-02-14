namespace ZaicoApiInteractor.Models
{
    public class Item
    {
        public int id { get; set; }
        public string title { get; set; }
        public float? quantity { get; set; }
        public float? logical_quantity { get; set; }
        public string? unit { get; set; }
        public string? category { get; set; }
        public string? state { get; set; }
        public string? place { get; set; }
        public string? etc { get; set; }
        public string? code { get; set; }
        public string? group_tag { get; set; }
        public string? created_at { get; set; }
        public string? updated_at { get; set; }
        public string? user_group { get; set; } = "Base group";

        public List<OptionalAttribute>? optional_attributes { get; set; } = new List<OptionalAttribute>();
    }
}
