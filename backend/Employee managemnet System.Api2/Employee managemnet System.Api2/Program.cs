using EmployeeManagement.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ------------------- CONTROLLERS -------------------
builder.Services.AddControllers();

// ------------------- DATABASE -------------------
builder.Services.AddScoped<DatabaseHelper>();

// ------------------- SWAGGER -------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ------------------- JWT CONFIG -------------------
var jwt = builder.Configuration.GetSection("Jwt");

if (jwt == null)
    throw new Exception("JWT section missing in appsettings.json");

var key = Encoding.UTF8.GetBytes(jwt["Key"]);

// ------------------- AUTH -------------------
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.RequireHttpsMetadata = false;
        opt.SaveToken = true;

        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });

// ------------------- CORS (FIXED) -------------------
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("AllowReact", p =>
    {
        p.WithOrigins(
            "http://localhost:5173",  // Vite default
            "http://localhost:3000",   // React default
            "http://localhost:5174",   // Vite alternative
            "http://localhost:5175"    // Vite alternative
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();  // Important for auth
    });
});

var app = builder.Build();

// ------------------- PIPELINE -------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ⚠️ CORS MUST BE BEFORE Authentication and Authorization
app.UseCors("AllowReact");

// 🔥 ORDER MATTERS - Authentication then Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();