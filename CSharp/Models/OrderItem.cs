using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class OrderItem
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int order_id { get; set; }

        [Required]
        public int offering_id { get; set; }

        [Required]
        public DateTime start_at { get; set; }

        [Required]
        public DateTime end_at { get; set; }

        [Required]
        [Column(TypeName = "decimal(6,2)")]
        public decimal hours { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal price { get; set; }

        [Required]
        [Column(TypeName = "decimal(12,2)")]
        public decimal total { get; set; }

        // Navigation properties
        [ForeignKey("order_id")]
        public virtual Order Order { get; set; } = null!;

        [ForeignKey("offering_id")]
        public virtual Offering Offering { get; set; } = null!;

        public virtual Booking? Booking { get; set; }
    }
}
