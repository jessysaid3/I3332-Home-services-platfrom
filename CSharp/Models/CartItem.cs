using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class CartItem
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int cart_id { get; set; }

        [Required]
        public int offering_id { get; set; }

        [Required]
        public DateTime start_at { get; set; }

        [Required]
        public DateTime end_at { get; set; }

        [Required]
        [Column(TypeName = "decimal(12,2)")]
        public decimal hours { get; set; }

        // Navigation properties
        [ForeignKey("cart_id")]
        public virtual Cart Cart { get; set; } = null!;

        [ForeignKey("offering_id")]
        public virtual Offering Offering { get; set; } = null!;
    }
}
