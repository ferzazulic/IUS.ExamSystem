using IUS.ExamSystem.Application.Interfaces;
using IUS.ExamSystem.Application.Services;
using IUS.ExamSystem.Infrastructure.Auth;
using IUS.ExamSystem.Infrastructure.Data;
using IUS.ExamSystem.Infrastructure.Seeder;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

//builder.WebHost.UseUrls("http://localhost:5000", "https://localhost:5001");

// Add services to the container
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<JwtService>();

builder.Services.AddScoped<IExamService, ExamService>();
builder.Services.AddScoped<IConflictDetectionService, ConflictDetectionService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IRoomService, RoomService>();

builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = "SmartBearer";
        options.DefaultChallengeScheme = "SmartBearer";
    })
    .AddPolicyScheme("SmartBearer", "Local JWT or Azure AD", options =>
    {
        options.ForwardDefaultSelector = context =>
        {
            var authorization = context.Request.Headers.Authorization.ToString();
            if (!authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return "LocalJwt";
            }

            try
            {
                var token = authorization["Bearer ".Length..].Trim();
                var issuer = new JwtSecurityTokenHandler().ReadJwtToken(token).Issuer;

                return issuer.StartsWith(builder.Configuration["AzureAd:Instance"]!, StringComparison.OrdinalIgnoreCase)
                    ? "AzureAd"
                    : "LocalJwt";
            }
            catch
            {
                return "LocalJwt";
            }
        };
    })
    .AddJwtBearer("LocalJwt", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };
    })
    .AddMicrosoftIdentityWebApi(
        builder.Configuration.GetSection("AzureAd"),
        jwtBearerScheme: "AzureAd");

builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter JWT like: Bearer {token}",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();
app.UseDeveloperExceptionPage();
// Configure the HTTP request pipeline

app.UseSwagger();
app.UseSwaggerUI();

// Comment out for development to allow HTTP testing
// app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider
        .GetRequiredService<ILoggerFactory>()
        .CreateLogger("DatabaseStartup");

    await MigrateAndSeedDatabaseAsync(context, logger);
}

await app.RunAsync();

static async Task MigrateAndSeedDatabaseAsync(AppDbContext context, ILogger logger)
{
    const int maxAttempts = 12;

    for (var attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            await context.Database.MigrateAsync();
            await DbSeeder.SeedAsync(context);
            return;
        }
        catch (Exception ex) when (attempt < maxAttempts)
        {
            logger.LogWarning(
                ex,
                "Database is not ready yet. Retrying migration and seeding attempt {Attempt}/{MaxAttempts}.",
                attempt,
                maxAttempts);

            await Task.Delay(TimeSpan.FromSeconds(5));
        }
    }
}
