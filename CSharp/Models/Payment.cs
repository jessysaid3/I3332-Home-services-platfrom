using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class Payment
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int order_id { get; set; }

        [Required]
        [MaxLength(20)]
        public string method { get; set; } = string.Empty; // credit_card, paypal, etc.

        [Required]
        [MaxLength(20)]
        public string type { get; set; } = string.Empty; // payment, refund

        [Required]
        [MaxLength(20)]
        public string status { get; set; } = string.Empty; // pending, completed, failed

        [Required]
        [Column(TypeName = "decimal(12,2)")]
        public decimal amount { get; set; }

        [Required]
        [MaxLength(3)]
        public string curr { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? @ref { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("order_id")]
        public virtual Order Order { get; set; } = null!;
    }
}
