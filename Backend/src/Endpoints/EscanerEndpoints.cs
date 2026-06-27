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
        admin.MapGet("/{id:int}/{nombreEstadio}/funcionarios", GetFuncionarios);
        admin.MapGet("/{id:int}/{nombreEstadio}/funcionarios-posibles", GetFuncionariosPosibles);
        admin.MapPost("/{id:int}/{nombreEstadio}/funcionarios", AsignarFuncionario);
        admin.MapDelete("/{id:int}/{nombreEstadio}/funcionarios/{email}", DesasignarFuncionario);
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

    // ── Funcionario assignment ──

    private static async Task<IResult> GetFuncionarios(int id, string nombreEstadio, IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT u.email, u.nombre, f.num_legajo
            FROM FuncionarioEscaner fe
            JOIN Funcionario f ON f.email_usuario = fe.email_funcionario
            JOIN Usuario u ON u.email = f.email_usuario
            WHERE fe.id_escaner = @id AND fe.nombre_estadio = @estadio
            ORDER BY u.nombre";

        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", nombreEstadio));

        using var reader = cmd.ExecuteReader();
        var list = new List<object>();
        while (reader.Read())
        {
            list.Add(new
            {
                email = reader.GetString(0),
                nombre = reader.GetString(1),
                legajo = reader.GetInt32(2)
            });
        }

        return Results.Ok(list);
    }

    private static async Task<IResult> GetFuncionariosPosibles(int id, string nombreEstadio, IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT u.email, u.nombre, f.num_legajo,
                   CASE WHEN fe.email_funcionario IS NOT NULL THEN 1 ELSE 0 END AS asignado
            FROM Funcionario f
            JOIN Usuario u ON u.email = f.email_usuario
            JOIN FuncionarioTrabajaEstadio fte ON fte.email_funcionario = f.email_usuario
            LEFT JOIN FuncionarioEscaner fe
                ON fe.email_funcionario = f.email_usuario
               AND fe.id_escaner = @id
               AND fe.nombre_estadio = @estadio
            WHERE fte.nombre_estadio = @estadio
            ORDER BY u.nombre";

        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", nombreEstadio));

        using var reader = cmd.ExecuteReader();
        var list = new List<object>();
        while (reader.Read())
        {
            list.Add(new
            {
                email = reader.GetString(0),
                nombre = reader.GetString(1),
                legajo = reader.GetInt32(2),
                asignado = reader.GetInt32(3) == 1
            });
        }

        return Results.Ok(list);
    }

    private static async Task<IResult> AsignarFuncionario(int id, string nombreEstadio, AsignarFuncionarioRequest request, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO FuncionarioEscaner (email_funcionario, id_escaner, nombre_estadio)
            VALUES (@email, @id, @estadio)";

        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@email", request.Email));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", nombreEstadio));

        try
        {
            cmd.ExecuteNonQuery();
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1062)
        {
            return Results.Conflict(new { mensaje = "El funcionario ya está asignado a este escáner" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1452)
        {
            return Results.BadRequest(new { mensaje = "El funcionario o escáner no existen" });
        }

        return Results.Ok(new { mensaje = "Funcionario asignado correctamente" });
    }

    private static async Task<IResult> DesasignarFuncionario(int id, string nombreEstadio, string email, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            DELETE FROM FuncionarioEscaner
            WHERE email_funcionario = @email AND id_escaner = @id AND nombre_estadio = @estadio";

        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@email", email));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", nombreEstadio));

        int rows = cmd.ExecuteNonQuery();
        if (rows == 0)
            return Results.NotFound(new { mensaje = "Asignación no encontrada" });

        return Results.Ok(new { mensaje = "Funcionario desasignado correctamente" });
    }
}

public record AsignarFuncionarioRequest(string Email);
