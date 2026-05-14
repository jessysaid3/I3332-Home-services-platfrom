using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class Review
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int booking_id { get; set; }

        [Required]
        public int user_id { get; set; }

        [Required]
        [Range(1, 5)]
        public int rating { get; set; }

        [MaxLength(1000)]
        public string? note { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("booking_id")]
        public virtual Booking Booking { get; set; } = null!;

        [ForeignKey("user_id")]
        public virtual User User { get; set; } = null!;
    }
}
