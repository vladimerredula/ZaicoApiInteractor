using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using ZaicoApiInteractor;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Add DbContext with MySQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 32)) // Adjust MySQL version
    ));

builder.Services.AddAuthentication(
    CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Access/Login";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(60);
        options.AccessDeniedPath = "/AccessDenied";
        options.SlidingExpiration = true;
    });

builder.Services.AddAuthorization();

builder.Services.AddSession(options =>
{
    options.Cookie.HttpOnly = true; // Ensure session cookie is not accessible to client-side scripts
    options.Cookie.IsEssential = true; // Indicate that the session cookie is essential for the application
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Send session cookie only over HTTPS
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Session timeout set to 30 minutes
});

builder.Services.AddHttpContextAccessor();

builder.WebHost.UseUrls("http://*:5001");

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseSession();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Access}/{action=Index}/{id?}");

app.Run();
