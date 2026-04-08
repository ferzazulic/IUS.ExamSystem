builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<JwtService>();

builder.Services.AddScoped<IExamService, ExamService>();
builder.Services.AddScoped<IConflictDetectionService, ConflictDetectionService>();
builder.Services.AddScoped<IReportService, ReportService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer = false,
            ValidateAudience = false,
            IssuerSigningKey =
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes("SUPER_SECRET_KEY_123"))
        };
    });

builder.Services.AddAuthorization();