using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence;
public class DataContext : IdentityDbContext<AppUser>
{
    public DataContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<Activity> Activities { get; set; }
    public DbSet<ActivityAttendee> ActivityAttendees { get; set; }
    public DbSet<Photo> Photos { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<UserFollowing> UserFollowings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ActivityAttendee>(x => x.HasKey(y => new {y.AppUserId, y.ActivityId}));

        builder.Entity<ActivityAttendee>()
            .HasOne(x => x.AppUser)
            .WithMany(y => y.Activities)
            .HasForeignKey(k => k.AppUserId);

        builder.Entity<ActivityAttendee>()
            .HasOne(x => x.Activity)
            .WithMany(y => y.Attendees)
            .HasForeignKey(k => k.ActivityId);

        builder.Entity<Comment>()
            .HasOne(a => a.Activity)
            .WithMany(c => c.Comments)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.Entity<UserFollowing>(b => {
            b.HasKey(k => new { k.WatcherId, k.TargetId });

            b.HasOne(x => x.Watcher)
                .WithMany(m => m.Followings)
                .HasForeignKey(f => f.WatcherId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.Target)
                .WithMany(m => m.Followers)
                .HasForeignKey(f => f.TargetId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

}
