using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace HomeServicesPlatform.Models
{
    public class AdminAudit
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int admin_user_id { get; set; }

        [Required]
        [MaxLength(255)]
        public string action { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? entity_type { get; set; }

        public int? entity_id { get; set; }

        public JsonDocument? meta { get; set; } // JSONB

        public DateTime created_at { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("admin_user_id")]
        public virtual User AdminUser { get; set; } = null!;
    }
}
