using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class Order
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int user_id { get; set; }

        [Required]
        [MaxLength(30)]
        public string status { get; set; } = "pending_payment"; // pending_payment, paid, cancelled

        [Required]
        [Column(TypeName = "decimal(12,2)")]
        public decimal total { get; set; } = 0;

        [Required]
        [MaxLength(3)]
        public string curr { get; set; } = string.Empty;

        public DateTime created_at { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("user_id")]
        public virtual User User { get; set; } = null!;

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
