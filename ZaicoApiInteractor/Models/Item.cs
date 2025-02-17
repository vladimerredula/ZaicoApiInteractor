using System.ComponentModel.DataAnnotations;

namespace ZaicoApiInteractor.Models
{
    public class Item
    {
        [Display(Name = "Inventory ID")]
        public int id { get; set; }

        [Display(Name = "Title")]
        public string title { get; set; }

        [Display(Name = "Quatity")]
        public float? quantity { get; set; }

        [Display(Name = "Logical quantity")]
        public float? logical_quantity { get; set; }

        [Display(Name = "Unit")]
        public string? unit { get; set; }

        [Display(Name = "Category")]
        public string? category { get; set; }

        [Display(Name = "State")]
        public string? state { get; set; }

        [Display(Name = "Place")]
        public string? place { get; set; }

        [Display(Name = "Notes")]
        public string? etc { get; set; }

        [Display(Name = "QR code/Barcode")]
        public string? code { get; set; }

        [Display(Name = "Group Tag")]
        public string? group_tag { get; set; }

        [Display(Name = "Created at")]
        public string? created_at { get; set; }

        [Display(Name = "Updated at")]
        public string? updated_at { get; set; }

        [Display(Name = "Updated by")]
        public string? update_user_name { get; set; }

        [Display(Name = "user group")]
        public string? user_group { get; set; } = "Base group";
        public InventoryHistory? inventory_history { get; set; }
        public ItemImage? item_image { get; set; }
        public List<OptionalAttribute>? optional_attributes { get; set; } = new List<OptionalAttribute>();
    }

    public class InventoryHistory
    {
        public string? memo { get; set; }
    }

    public class ItemImage
    {
        public string? url { get; set; }
    }
}
