using ObligatorioAPI.Data;
using ObligatorioAPI.Models;

namespace ObligatorioAPI.Endpoints;

public static class EquipoEndpoints
{
    public static void MapEquipoEndpoints(this WebApplication app)
    {
        app.MapGet("/api/equipos", GetAll);
        app.MapGet("/api/equipos/{nombre}/{codPais}", GetById);

        var admin = app.MapGroup("/api/equipos").RequireAuthorization("AdminOnly");
        admin.MapPost("/", Create);
        admin.MapPut("/{nombre}/{codPais}", Update);
        admin.MapDelete("/{nombre}/{codPais}", Delete);
    }

    private static async Task<IResult> GetAll(IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT nombre, cod_pais FROM Equipo ORDER BY nombre";

        using var reader = cmd.ExecuteReader();
        var equipos = new List<Equipo>();
        while (reader.Read())
        {
            equipos.Add(new Equipo
            {
                Nombre = reader.GetString(0),
                CodPais = reader.GetString(1)
            });
        }

        return Results.Ok(equipos);
    }

    private static async Task<IResult> GetById(string nombre, string codPais, IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT nombre, cod_pais FROM Equipo WHERE nombre = @nombre AND cod_pais = @codPais";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nombre", nombre));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@codPais", codPais));

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
            return Results.NotFound(new { mensaje = "Equipo no encontrado" });

        return Results.Ok(new Equipo
        {
            Nombre = reader.GetString(0),
            CodPais = reader.GetString(1)
        });
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

        return Results.Created($"/api/equipos/{equipo.Nombre}/{equipo.CodPais}", equipo);
    }

    private static async Task<IResult> Update(string nombre, string codPais, Equipo equipo, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE Equipo SET nombre = @nuevo_nombre, cod_pais = @nuevo_pais WHERE nombre = @nombre AND cod_pais = @codPais";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nombre", nombre));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@codPais", codPais));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nuevo_nombre", equipo.Nombre));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nuevo_pais", equipo.CodPais));

        try
        {
            int rows = cmd.ExecuteNonQuery();
            if (rows == 0)
                return Results.NotFound(new { mensaje = "Equipo no encontrado" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1062)
        {
            return Results.Conflict(new { mensaje = "El equipo ya existe" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1452)
        {
            return Results.BadRequest(new { mensaje = "El código de país no existe" });
        }

        return Results.Ok(equipo);
    }

    private static async Task<IResult> Delete(string nombre, string codPais, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM Equipo WHERE nombre = @nombre AND cod_pais = @codPais";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nombre", nombre));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@codPais", codPais));

        try
        {
            int rows = cmd.ExecuteNonQuery();
            if (rows == 0)
                return Results.NotFound(new { mensaje = "Equipo no encontrado" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1452)
        {
            return Results.Conflict(new { mensaje = "El equipo tiene referencias y no puede eliminarse" });
        }

        return Results.NoContent();
    }
}
