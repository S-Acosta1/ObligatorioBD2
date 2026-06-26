using ObligatorioAPI.Data;
using ObligatorioAPI.Models;

namespace ObligatorioAPI.Endpoints;

public static class SectorEndpoints
{
    public static void MapSectorEndpoints(this WebApplication app)
    {
        app.MapGet("/api/estadios/{nombreEstadio}/sectores", GetAll);
        app.MapGet("/api/estadios/{nombreEstadio}/sectores/{idSector:int}", GetById);

        var admin = app.MapGroup("/api/estadios/{nombreEstadio}/sectores").RequireAuthorization("AdminOnly");
        admin.MapPost("/", Create);
        admin.MapPut("/{idSector:int}", Update);
        admin.MapDelete("/{idSector:int}", Delete);
    }

    private static async Task<IResult> GetAll(string nombreEstadio, IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT id_sector, nombre_estadio, nombre, capacidad_maxima FROM Sector WHERE nombre_estadio = @estadio ORDER BY nombre";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", nombreEstadio));

        using var reader = cmd.ExecuteReader();
        var sectores = new List<Sector>();
        while (reader.Read())
        {
            sectores.Add(new Sector
            {
                Id = reader.GetInt32(0),
                NombreEstadio = reader.GetString(1),
                Nombre = reader.GetString(2),
                CapacidadMaxima = reader.GetInt32(3)
            });
        }

        return Results.Ok(sectores);
    }

    private static async Task<IResult> GetById(string nombreEstadio, int idSector, IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT id_sector, nombre_estadio, nombre, capacidad_maxima FROM Sector WHERE id_sector = @id AND nombre_estadio = @estadio";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", idSector));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", nombreEstadio));

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
            return Results.NotFound(new { mensaje = "Sector no encontrado" });

        return Results.Ok(new Sector
        {
            Id = reader.GetInt32(0),
            NombreEstadio = reader.GetString(1),
            Nombre = reader.GetString(2),
            CapacidadMaxima = reader.GetInt32(3)
        });
    }

    private static async Task<IResult> Create(string nombreEstadio, Sector sector, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT INTO Sector (nombre_estadio, nombre, capacidad_maxima) VALUES (@estadio, @nombre, @capacidad)";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", nombreEstadio));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nombre", sector.Nombre));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@capacidad", sector.CapacidadMaxima));

        try
        {
            cmd.ExecuteNonQuery();
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1062)
        {
            return Results.Conflict(new { mensaje = "El sector ya existe en este estadio" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1452)
        {
            return Results.BadRequest(new { mensaje = "El estadio no existe" });
        }

        return Results.Created($"/api/estadios/{nombreEstadio}/sectores/{sector.Nombre}", sector);
    }

    private static async Task<IResult> Update(string nombreEstadio, int idSector, Sector sector, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE Sector SET nombre = @nombre, capacidad_maxima = @capacidad WHERE id_sector = @id AND nombre_estadio = @estadio";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", idSector));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", nombreEstadio));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nombre", sector.Nombre));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@capacidad", sector.CapacidadMaxima));

        int rows = cmd.ExecuteNonQuery();
        if (rows == 0)
            return Results.NotFound(new { mensaje = "Sector no encontrado" });

        return Results.Ok(sector);
    }

    private static async Task<IResult> Delete(string nombreEstadio, int idSector, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM Sector WHERE id_sector = @id AND nombre_estadio = @estadio";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", idSector));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", nombreEstadio));

        int rows = cmd.ExecuteNonQuery();
        if (rows == 0)
            return Results.NotFound(new { mensaje = "Sector no encontrado" });

        return Results.NoContent();
    }
}
