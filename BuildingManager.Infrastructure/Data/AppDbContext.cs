using BuildingManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BuildingManager.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Building> Buildings => Set<Building>();
    public DbSet<Floor> Floors => Set<Floor>();
    public DbSet<Office> Offices => Set<Office>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<BankTransaction> BankTransactions => Set<BankTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Company>()
            .HasIndex(c => c.TaxCode)
            .IsUnique();

        modelBuilder.Entity<Contract>()
            .HasOne(c => c.Company)
            .WithMany(co => co.Contracts)
            .HasForeignKey(c => c.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Contract>()
            .HasOne(c => c.Office)
            .WithMany(o => o.Contracts)
            .HasForeignKey(c => c.OfficeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.Contract)
            .WithMany(c => c.Invoices)
            .HasForeignKey(i => i.ContractId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.Company)
            .WithMany()
            .HasForeignKey(i => i.CompanyId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Office>()
            .Property(o => o.PricePerM2)
            .HasColumnType("numeric(18,2)");

        modelBuilder.Entity<Office>()
            .Property(o => o.Area)
            .HasColumnType("numeric(18,2)");

        modelBuilder.Entity<Contract>()
            .Property(c => c.MonthlyRent)
            .HasColumnType("numeric(18,2)");

        modelBuilder.Entity<Contract>()
            .Property(c => c.Deposit)
            .HasColumnType("numeric(18,2)");

        modelBuilder.Entity<Invoice>()
            .Property(i => i.RentAmount).HasColumnType("numeric(18,2)");
        modelBuilder.Entity<Invoice>()
            .Property(i => i.ElectricityAmount).HasColumnType("numeric(18,2)");
        modelBuilder.Entity<Invoice>()
            .Property(i => i.WaterAmount).HasColumnType("numeric(18,2)");
        modelBuilder.Entity<Invoice>()
            .Property(i => i.ServiceFee).HasColumnType("numeric(18,2)");
        modelBuilder.Entity<Invoice>()
            .Property(i => i.TotalAmount).HasColumnType("numeric(18,2)");

        modelBuilder.Entity<Building>()
            .Property(b => b.TotalArea).HasColumnType("numeric(18,2)");

        modelBuilder.Entity<Floor>()
            .Property(f => f.TotalArea).HasColumnType("numeric(18,2)");

        modelBuilder.Entity<BankTransaction>()
            .Property(t => t.TransferAmount).HasColumnType("numeric(18,2)");

        modelBuilder.Entity<BankTransaction>()
            .HasOne(t => t.MatchedInvoice)
            .WithMany()
            .HasForeignKey(t => t.MatchedInvoiceId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
