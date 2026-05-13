using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class Address
    {
        [Key]
        public int id { get; set; }

        [Required]
        [MaxLength(100)]
        public string country { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string city { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string street { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? building { get; set; }

        public int? floor { get; set; }

        [MaxLength(100)]
        public string? apartment { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<User> Users { get; set; } = new List<User>();
        public virtual ICollection<Provider> Providers { get; set; } = new List<Provider>();
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
