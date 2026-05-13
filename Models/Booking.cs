using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class Booking
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int order_item_id { get; set; }

        [Required]
        public int user_id { get; set; }

        [Required]
        public int addr_id { get; set; }

        [Required]
        [MaxLength(20)]
        public string status { get; set; } = "requested"; // requested, confirmed, completed, cancelled

        public DateTime created_at { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("order_item_id")]
        public virtual OrderItem OrderItem { get; set; } = null!;

        [ForeignKey("user_id")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("addr_id")]
        public virtual Address Address { get; set; } = null!;

        public virtual ICollection<TimeSlot> TimeSlots { get; set; } = new List<TimeSlot>();
        public virtual Review? Review { get; set; }
    }
}
