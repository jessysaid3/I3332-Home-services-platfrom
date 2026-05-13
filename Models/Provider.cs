using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class Provider
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int user_id { get; set; }

        [Required]
        [MaxLength(20)]
        public string approved { get; set; } = "pending"; // pending, approved, rejected

        [MaxLength(1000)]
        public string? bio { get; set; }

        [Required]
        public int addr_id { get; set; }

        [Required]
        [Column(TypeName = "decimal(3,2)")]
        public decimal rating_avg { get; set; } = 0;

        [Required]
        public int rating_count { get; set; } = 0;

        // Navigation properties
        [ForeignKey("user_id")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("addr_id")]
        public virtual Address Address { get; set; } = null!;

        public virtual ICollection<Offering> Offerings { get; set; } = new List<Offering>();
        public virtual ICollection<TimeSlot> TimeSlots { get; set; } = new List<TimeSlot>();
    }
}
