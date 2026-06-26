using ObligatorioAPI.Data;
using ObligatorioAPI.Models;

namespace ObligatorioAPI.Endpoints;

public static class EquipoEndpoints
{
    public static void MapEquipoEndpoints(this WebApplication app)
    {
        var admin = app.MapGroup("/api/equipos").RequireAuthorization("AdminOnly");
        admin.MapPost("/", Create);
    }

    private static async Task<IResult> Create(Equipo equipo, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT INTO Equipo (nombre, cod_pais) VALUES (@nombre, @cod_pais)";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nombre", equipo.Nombre));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@cod_pais", equipo.CodPais));

        try
        {
            cmd.ExecuteNonQuery();
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1062)
        {
            return Results.Conflict(new { mensaje = "El equipo ya existe" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1452)
        {
            return Results.BadRequest(new { mensaje = "El código de país no existe" });
        }

        return Results.Created($"/api/equipos/{equipo.Nombre}", equipo);
    }
}
