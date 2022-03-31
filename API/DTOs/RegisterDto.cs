using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string DisplayName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

// {6,12}$ from 6 -> 12 characters length
// (?=.*\\d) number
        [Required]
        [RegularExpression("(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,12}$", ErrorMessage = "Password is not strong enough!")]
        public string Password { get; set; }

        [Required]
        public string Username { get; set; }

    }
}