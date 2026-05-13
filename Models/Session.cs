using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class Session
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int user_id { get; set; }

        [Required]
        [MaxLength(255)]
        public string token { get; set; } = string.Empty;

        [Required]
        public bool is_active { get; set; } = true;

        public DateTime created_at { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime expires_at { get; set; }

        // Navigation properties
        [ForeignKey("user_id")]
        public virtual User User { get; set; } = null!;
    }
}
