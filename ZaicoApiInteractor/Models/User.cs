using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ZaicoApiInteractor.Models
{
    public class User
    {
        [Key]
        [Display(Name = "Personnel ID")]
        public int Personnel_ID { get; set; }

        [Required]
        [Column(TypeName = "VARCHAR")]
        [Display(Name = "Username")]
        [StringLength(20)]
        public string Username { get; set; }

        [Required]
        [Column(TypeName = "VARCHAR")]
        [Display(Name = "Password")]
        [StringLength(20)]
        public string Password { get; set; }

        [Column(TypeName = "VARCHAR")]
        [Display(Name = "First name")]
        [StringLength(50)]
        public string? First_name { get; set; }

        [Column(TypeName = "VARCHAR")]
        [Display(Name = "Last name")]
        [StringLength(50)]
        public string? Last_name { get; set; }
        public string? Email { get; set; }
        public string? ApiToken { get; set; }

        public int Status { get; set; } = 0;
        public DateTime? Last_password_changed { get; set; }
    }
}