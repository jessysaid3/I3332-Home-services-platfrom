using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class Offering
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int provider_id { get; set; }

        [Required]
        public int service_id { get; set; }

        [MaxLength(150)]
        public string? title { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal rate { get; set; }

        [Required]
        [MaxLength(3)]
        public string curr { get; set; } = string.Empty;

        [Required]
        public bool active { get; set; } = true;

        // Navigation properties
        [ForeignKey("provider_id")]
        public virtual Provider Provider { get; set; } = null!;

        [ForeignKey("service_id")]
        public virtual Service Service { get; set; } = null!;

        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
