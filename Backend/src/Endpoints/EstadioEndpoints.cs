using ObligatorioAPI.Data;
using ObligatorioAPI.Models;

namespace ObligatorioAPI.Endpoints;

public static class EstadioEndpoints
{
    public static void MapEstadioEndpoints(this WebApplication app)
    {
        app.MapGet("/api/estadios", GetAll);
        app.MapGet("/api/estadios/pais/{codPais}", GetByPais);
        app.MapGet("/api/estadios/{nombre}", GetByNombre);

        var admin = app.MapGroup("/api/estadios").RequireAuthorization("AdminOnly");
        admin.MapPost("/", Create);
        admin.MapPut("/{nombre}", Update);
        admin.MapDelete("/{nombre}", Delete);
    }

    private static async Task<IResult> GetAll(IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT nombre, cod_pais FROM Estadio";

        using var reader = cmd.ExecuteReader();

        var estadios = new List<Estadio>();
        while (reader.Read())
        {
            estadios.Add(new Estadio
            {
                Nombre = reader.GetString(0),
                CodPais = reader.GetString(1)
            });
        }

        return Results.Ok(estadios);
    }

    private static async Task<IResult> GetByPais(string codPais, IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT nombre, cod_pais FROM Estadio WHERE cod_pais = @codPais";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@codPais", codPais));

        using var reader = cmd.ExecuteReader();

        var estadios = new List<Estadio>();
        while (reader.Read())
        {
            estadios.Add(new Estadio
            {
                Nombre = reader.GetString(0),
                CodPais = reader.GetString(1)
            });
        }

        return Results.Ok(estadios);
    }

    private static async Task<IResult> GetByNombre(string nombre, IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT nombre, cod_pais FROM Estadio WHERE nombre = @nombre";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nombre", nombre));

        using var reader = cmd.ExecuteReader();

        if (!reader.Read())
            return Results.NotFound(new { mensaje = "Estadio no encontrado" });

        return Results.Ok(new Estadio
        {
            Nombre = reader.GetString(0),
            CodPais = reader.GetString(1)
        });
    }

    private static async Task<IResult> Create(Estadio estadio, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT INTO Estadio (nombre, cod_pais) VALUES (@nombre, @cod_pais)";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nombre", estadio.Nombre));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@cod_pais", estadio.CodPais));

        try
        {
            cmd.ExecuteNonQuery();
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1062)
        {
            return Results.Conflict(new { mensaje = "El estadio ya existe" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1452)
        {
            return Results.BadRequest(new { mensaje = "El código de país no existe" });
        }

        return Results.Created($"/api/estadios/{estadio.Nombre}", estadio);
    }

    private static async Task<IResult> Update(string nombre, Estadio estadio, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE Estadio SET nombre = @nuevo_nombre, cod_pais = @cod_pais WHERE nombre = @nombre";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nombre", nombre));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nuevo_nombre", estadio.Nombre));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@cod_pais", estadio.CodPais));

        try
        {
            int rows = cmd.ExecuteNonQuery();

            if (rows == 0)
                return Results.NotFound(new { mensaje = "Estadio no encontrado" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1062)
        {
            return Results.Conflict(new { mensaje = "El nombre nuevo del estadio ya existe" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1452)
        {
            return Results.BadRequest(new { mensaje = "El código de país no existe" });
        }

        return Results.Ok(estadio);
    }

    private static async Task<IResult> Delete(string nombre, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM Estadio WHERE nombre = @nombre";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nombre", nombre));

        try
        {
            int rows = cmd.ExecuteNonQuery();

            if (rows == 0)
                return Results.NotFound(new { mensaje = "Estadio no encontrado" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1452)
        {
            return Results.Conflict(new { mensaje = "El estadio tiene referencias y no puede eliminarse" });
        }

        return Results.NoContent();
    }
}
