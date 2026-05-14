using System.ComponentModel.DataAnnotations;

namespace HomeServicesPlatform.Models
{
    public class Service
    {
        [Key]
        public int id { get; set; }

        [Required]
        [MaxLength(120)]
        public string name { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<Offering> Offerings { get; set; } = new List<Offering>();
    }
}
