using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using ObligatorioAPI.Data;
using ObligatorioAPI.Endpoints;
using ObligatorioAPI.Services;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddSingleton<DbConnectionProvider>();
builder.Services.AddSingleton<IAuthDatabase, AuthDatabase>();
builder.Services.AddSingleton<IUsuarioDatabase, UsuarioDatabase>();
builder.Services.AddSingleton<IUsuarioLecturaDatabase, UsuarioLecturaDatabase>();
builder.Services.AddSingleton<IFuncionarioDatabase, FuncionarioDatabase>();
builder.Services.AddSingleton<IAdministradorDatabase, AdministradorDatabase>();
builder.Services.AddSingleton<IAdministradorLecturaDatabase, AdministradorLecturaDatabase>();
builder.Services.AddSingleton<QrCodeService>();
builder.Services.AddHostedService<QrCodeRotationService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
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
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? ""))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("admin"));
    options.AddPolicy("FuncionarioOnly", policy =>
        policy.RequireRole("funcionario"));
    options.AddPolicy("UsuarioOnly", policy =>
        policy.RequireRole("usuario"));
    options.AddPolicy("AdminOrFuncionario", policy =>
        policy.RequireRole("admin", "funcionario"));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.Use(async (context, next) =>
{
    context.Response.Headers["Access-Control-Allow-Origin"] = "*";
    context.Response.Headers["Access-Control-Allow-Headers"] = "*";
    context.Response.Headers["Access-Control-Allow-Methods"] = "*";

    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 204;
        return;
    }

    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapEquipoEndpoints();
app.MapEstadioEndpoints();
app.MapEventoEndpoints();
app.MapPaisEndpoints();
app.MapTipoDocumentoEndpoints();
app.MapSectorEndpoints();
app.MapUsuarioEndpoints();
app.MapEscanerEndpoints();
app.MapAdminFuncionariosEndpoints();
app.MapAdminAsignacionesEndpoints();
app.MapAdminReportEndpoints();
app.MapCompraEndpoints();
app.MapTransferenciaEndpoints();
app.MapQrEndpoints();

app.Run();
