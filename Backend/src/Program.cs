using ObligatorioAPI.Data;
using ObligatorioAPI.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddSingleton<DbConnectionProvider>();
builder.Services.AddSingleton<IUsuarioDatabase, UsuarioDatabase>();
builder.Services.AddSingleton<IUsuarioLecturaDatabase, UsuarioLecturaDatabase>();
builder.Services.AddSingleton<IFuncionarioDatabase, FuncionarioDatabase>();
builder.Services.AddSingleton<IAdministradorDatabase, AdministradorDatabase>();
builder.Services.AddSingleton<IAdministradorLecturaDatabase, AdministradorLecturaDatabase>();
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapEventoEndpoints();
app.MapEstadioEndpoints();
app.MapPaisEndpoints();
app.MapEquipoEndpoints();

app.Run();
