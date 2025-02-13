using Microsoft.EntityFrameworkCore;
using ZaicoApiInteractor.Models;

namespace ZaicoApiInteractor
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }


    }
}
