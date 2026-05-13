using HomeServicesPlatform.Models;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Address> addresses { get; set; }
        public DbSet<User> users { get; set; }
        public DbSet<Session> sessions { get; set; }
        public DbSet<Provider> providers { get; set; }
        public DbSet<Service> services { get; set; }
        public DbSet<Offering> offerings { get; set; }
        public DbSet<Cart> carts { get; set; }
        public DbSet<CartItem> cart_items { get; set; }
        public DbSet<Order> orders { get; set; }
        public DbSet<OrderItem> order_items { get; set; }
        public DbSet<Booking> bookings { get; set; }
        public DbSet<TimeSlot> time_slots { get; set; }
        public DbSet<Payment> payments { get; set; }
        public DbSet<Review> reviews { get; set; }
        public DbSet<AdminAudit> admin_audit { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasOne(u => u.Address)
                .WithMany(a => a.Users)
                .HasForeignKey(u => u.addr_id)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Session>()
                .HasOne(s => s.User)
                .WithMany(u => u.Sessions)
                .HasForeignKey(s => s.user_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Provider>()
                .HasOne(p => p.User)
                .WithOne(u => u.Provider)
                .HasForeignKey<Provider>(p => p.user_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Provider>()
                .HasOne(p => p.Address)
                .WithMany(a => a.Providers)
                .HasForeignKey(p => p.addr_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Offering>()
                .HasOne(o => o.Provider)
                .WithMany(p => p.Offerings)
                .HasForeignKey(o => o.provider_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Offering>()
                .HasOne(o => o.Service)
                .WithMany(s => s.Offerings)
                .HasForeignKey(o => o.service_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Cart>()
                .HasOne(c => c.User)
                .WithMany(u => u.Carts)
                .HasForeignKey(c => c.user_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.CartItems)
                .HasForeignKey(ci => ci.cart_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.user_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.order_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.OrderItem)
                .WithOne(oi => oi.Booking)
                .HasForeignKey<Booking>(b => b.order_item_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.user_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Address)
                .WithMany(a => a.Bookings)
                .HasForeignKey(b => b.addr_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Booking)
                .WithOne(b => b.Review)
                .HasForeignKey<Review>(r => r.booking_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.user_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TimeSlot>()
                .HasOne(ts => ts.Provider)
                .WithMany(p => p.TimeSlots)
                .HasForeignKey(ts => ts.provider_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TimeSlot>()
                .HasOne(ts => ts.Booking)
                .WithMany(b => b.TimeSlots)
                .HasForeignKey(ts => ts.booking_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Order)
                .WithMany(o => o.Payments)
                .HasForeignKey(p => p.order_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AdminAudit>()
                .HasOne(a => a.AdminUser)
                .WithMany(u => u.AdminAuditsAsAdmin)
                .HasForeignKey(a => a.admin_user_id)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
