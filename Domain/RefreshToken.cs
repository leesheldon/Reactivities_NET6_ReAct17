using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class RefreshToken
    {
        public int Id { get; set; }

        public AppUser AppUser { get; set; }

        public string Token { get; set; }

        public DateTime ExpireDate { get; set; } = DateTime.UtcNow.AddDays(7);

        public bool IsExpired => DateTime.UtcNow >= ExpireDate;
        
        public DateTime? Revoke { get; set; }

        public bool IsActive => Revoke == null && !IsExpired;
        
    }
}