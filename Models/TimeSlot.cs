using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class TimeSlot
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int provider_id { get; set; }

        [Required]
        public DateTime start_at { get; set; }

        [Required]
        public DateTime end_at { get; set; }

        public int? booking_id { get; set; }

        // Navigation properties
        [ForeignKey("provider_id")]
        public virtual Provider Provider { get; set; } = null!;

        [ForeignKey("booking_id")]
        public virtual Booking? Booking { get; set; }
    }
}
