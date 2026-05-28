using IUS.ExamSystem.Application.Interfaces;
using IUS.ExamSystem.Application.Services;
using IUS.ExamSystem.Infrastructure.Auth;
using IUS.ExamSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddScoped<IExamService, ExamService>();
builder.Services.AddScoped<IConflictDetectionService, ConflictDetectionService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IRoomService, RoomService>();

builder.Services.AddScoped<JwtService>();

var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key configuration missing");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer configuration missing");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience configuration missing");
var azureInstance = builder.Configuration["AzureAd:Instance"] ?? throw new InvalidOperationException("AzureAd:Instance configuration missing");
var azureTenant = builder.Configuration["AzureAd:TenantId"] ?? throw new InvalidOperationException("AzureAd:TenantId configuration missing");
var azureAudience = builder.Configuration["AzureAd:Audience"] ?? throw new InvalidOperationException("AzureAd:Audience configuration missing");

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "Bearer";
    options.DefaultChallengeScheme = "Bearer";
})
.AddPolicyScheme("Bearer", "Bearer or Azure token", options =>
{
    options.ForwardDefaultSelector = context =>
    {
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var token = authHeader.Substring("Bearer ".Length).Trim();
            try
            {
                var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
                if (jwt.Issuer == builder.Configuration["Jwt:Issuer"])
                {
                    return "LocalJwt";
                }
            }
            catch
            {
                // fall back to Azure token validation
            }
        }

        return "AzureJwt";
    };
})
.AddJwtBearer("LocalJwt", options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(2)
    };
})
.AddJwtBearer("AzureJwt", options =>
{
    options.Authority = $"{azureInstance}{azureTenant}";
    options.Audience = azureAudience;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuers = new[]
        {
            $"{azureInstance}{azureTenant}/v2.0",
            $"{azureInstance}{azureTenant}"
        }
    };
});

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

// Run migrations on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseSwagger();
app.UseSwaggerUI();

// Comment out for development to allow HTTP testing
// app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await app.RunAsync();