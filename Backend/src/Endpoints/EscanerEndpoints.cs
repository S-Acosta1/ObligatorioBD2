using ObligatorioAPI.Data;
using ObligatorioAPI.Models;

namespace ObligatorioAPI.Endpoints;

public static class EscanerEndpoints
{
    public static void MapEscanerEndpoints(this WebApplication app)
    {
        app.MapGet("/api/escaners", GetAll);
        app.MapGet("/api/escaners/{id:int}/{nombreEstadio}", GetById);

        var admin = app.MapGroup("/api/escaners").RequireAuthorization("AdminOnly");
        admin.MapPost("/", Create);
        admin.MapDelete("/{id:int}/{nombreEstadio}", Delete);
    }

    private static async Task<IResult> GetAll(IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT id_escaner, nombre_estadio FROM Escaner ORDER BY id_escaner";

        using var reader = cmd.ExecuteReader();
        var escaners = new List<Escaner>();
        while (reader.Read())
        {
            escaners.Add(new Escaner
            {
                Id = reader.GetInt32(0),
                NombreEstadio = reader.GetString(1)
            });
        }

        return Results.Ok(escaners);
    }

    private static async Task<IResult> GetById(int id, string nombreEstadio, IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT id_escaner, nombre_estadio FROM Escaner WHERE id_escaner = @id AND nombre_estadio = @estadio";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", nombreEstadio));

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
            return Results.NotFound(new { mensaje = "Escaner no encontrado" });

        return Results.Ok(new Escaner
        {
            Id = reader.GetInt32(0),
            NombreEstadio = reader.GetString(1)
        });
    }

    private static async Task<IResult> Create(Escaner escaner, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT INTO Escaner (id_escaner, nombre_estadio) VALUES (@id, @estadio)";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", escaner.Id));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", escaner.NombreEstadio));

        try
        {
            cmd.ExecuteNonQuery();
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1062)
        {
            return Results.Conflict(new { mensaje = "El escaner ya existe en ese estadio" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1452)
        {
            return Results.BadRequest(new { mensaje = "El estadio no existe" });
        }

        return Results.Created($"/api/escaners/{escaner.Id}/{escaner.NombreEstadio}", escaner);
    }

    private static async Task<IResult> Delete(int id, string nombreEstadio, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM Escaner WHERE id_escaner = @id AND nombre_estadio = @estadio";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", nombreEstadio));

        try
        {
            int rows = cmd.ExecuteNonQuery();
            if (rows == 0)
                return Results.NotFound(new { mensaje = "Escaner no encontrado" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1452)
        {
            return Results.Conflict(new { mensaje = "El escaner tiene referencias y no puede eliminarse" });
        }

        return Results.NoContent();
    }
}
