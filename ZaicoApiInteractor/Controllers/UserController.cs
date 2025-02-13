using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZaicoApiInteractor.Models;
using System.Security.Claims;

namespace ZaicoApiInteractor.Controllers
{
    [Authorize]
    public class UserController : Controller
    {
        private readonly ApplicationDbContext _db;

        public UserController(ApplicationDbContext dbContext)
        {
            _db = dbContext;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult ChangePassword(string current, string newpass, string confirmpass)
        {
            var personnelId = GetPersonnelID();

            var user = _db.Users.FirstOrDefault(u => u.Personnel_ID == personnelId && u.Password == current);

            if (user != null)
            {
                user.Password = newpass;
                user.Last_password_changed = DateTime.Now;
                _db.SaveChanges();

                TempData["message"] = "success-Password successfully changed.";
            }
            else
            {
                TempData["passerror"] = "Incorrect password";
            }

            // Get the referrer URL
            string referrerUrl = Request.Headers["Referer"].ToString();

            if (!string.IsNullOrEmpty(referrerUrl))
            {
                // Parse the referrer URL to extract controller information if needed
                // This step assumes the referrer URL is in the standard routing format
                Uri referrerUri = new Uri(referrerUrl);
                var segments = referrerUri.Segments;
                string previousController = segments.Length > 1 ? segments[1].Trim('/') : string.Empty;

                return RedirectToAction("Index", previousController);
            }

            return RedirectToAction("Index", "Home");
            //return View("Profile");
        }

        [HttpPost]
        public IActionResult ResetPassword(int personnelid, string newpass, string confirmpass)
        {
            var user = _db.Users.FirstOrDefault(u => u.Personnel_ID == personnelid);

            if (user != null)
            {
                user.Password = newpass;
                user.Last_password_changed = DateTime.Now;
                _db.SaveChanges();

                TempData["message"] = "success-Password successfully changed.";
            }
            else
            {
                TempData["message"] = "danger-User not found";
            }

            return RedirectToAction(nameof(Index));
        }

        public int GetPersonnelID()
        {
            var personnelId = int.Parse(User.FindFirstValue("Personnelid"));

            return personnelId;
        }

        public async Task<string> GetUsername()
        {
            var user = await ThisUser();
            return user.Username;
        }

        public async Task<User> ThisUser()
        {
            return _db.Users.Find(GetPersonnelID());
        }
    }
}
