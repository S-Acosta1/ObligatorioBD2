using ObligatorioAPI.Data;
using ObligatorioAPI.Models;

namespace ObligatorioAPI.Endpoints;

public static class EventoEndpoints
{
    public static void MapEventoEndpoints(this WebApplication app)
    {
        app.MapGet("/api/eventos", GetAll);
        app.MapGet("/api/eventos/{id:int}", GetById);
        app.MapGet("/api/eventos/{idEvento:int}/sectores-habilitados", GetSectoresHabilitados);

        var admin = app.MapGroup("/api/eventos").RequireAuthorization("AdminOnly");
        admin.MapPost("/", Create);
        admin.MapPut("/{id:int}", Update);
        admin.MapDelete("/{id:int}", Delete);
        admin.MapPost("/{idEvento:int}/sectores-habilitados", HabilitarSector);
        admin.MapDelete("/{idEvento:int}/sectores-habilitados/{idSector:int}", DeshabilitarSector);
    }

    private static async Task<IResult> GetAll(IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT e.id_evento, est.nombre, el.nombre, ev.nombre,
                   e.fecha_hora, e.ubicacion,
                   e.pais_equipo_a, e.pais_equipo_b,
                   COALESCE(SUM(ehs.asientos_disponibles), 0) AS asientos_disponibles
            FROM Evento e
            JOIN Estadio est ON est.nombre = e.nombre_estadio
            JOIN Equipo el  ON el.nombre = e.nombre_equipo_a AND el.cod_pais = e.pais_equipo_a
            JOIN Equipo ev  ON ev.nombre = e.nombre_equipo_b AND ev.cod_pais = e.pais_equipo_b
            LEFT JOIN EventoHabilitaSector ehs ON ehs.id_evento = e.id_evento
            GROUP BY e.id_evento, est.nombre, el.nombre, ev.nombre,
                     e.fecha_hora, e.ubicacion,
                     e.pais_equipo_a, e.pais_equipo_b
            ORDER BY e.fecha_hora DESC";

        using var reader = cmd.ExecuteReader();
        var eventos = new List<object>();
        while (reader.Read())
        {
            eventos.Add(new
            {
                id = reader.GetInt32(0),
                estadio = reader.GetString(1),
                equipoLocal = reader.GetString(2),
                equipoVisitante = reader.GetString(3),
                fechaHora = reader.GetDateTime(4),
                ubicacion = reader.GetString(5),
                paisEquipoLocal = reader.GetString(6),
                paisEquipoVisitante = reader.GetString(7),
                asientosDisponibles = reader.GetInt32(8)
            });
        }

        return Results.Ok(eventos);
    }

    private static async Task<IResult> GetById(int id, IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT e.id_evento, est.nombre, el.nombre, ev.nombre,
                   e.fecha_hora, e.ubicacion,
                   e.pais_equipo_a, e.pais_equipo_b
            FROM Evento e
            JOIN Estadio est ON est.nombre = e.nombre_estadio
            JOIN Equipo el  ON el.nombre = e.nombre_equipo_a AND el.cod_pais = e.pais_equipo_a
            JOIN Equipo ev  ON ev.nombre = e.nombre_equipo_b AND ev.cod_pais = e.pais_equipo_b
            WHERE e.id_evento = @id";

        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
            return Results.NotFound(new { mensaje = "Evento no encontrado" });

        return Results.Ok(new
        {
            id = reader.GetInt32(0),
            estadio = reader.GetString(1),
            equipoLocal = reader.GetString(2),
            equipoVisitante = reader.GetString(3),
            fechaHora = reader.GetDateTime(4),
            ubicacion = reader.GetString(5),
            paisEquipoLocal = reader.GetString(6),
            paisEquipoVisitante = reader.GetString(7)
        });
    }

    private static async Task<IResult> Create(HttpContext http, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var body = await http.Request.ReadFromJsonAsync<CreateEventoRequest>();
        if (body is null)
            return Results.BadRequest(new { mensaje = "Cuerpo inválido" });

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO Evento (fecha_hora, ubicacion, nombre_estadio,
                                nombre_equipo_a, pais_equipo_a,
                                nombre_equipo_b, pais_equipo_b)
            VALUES (@fecha, @ubicacion, @estadio,
                    @eqA, @paisA, @eqB, @paisB);
            SELECT LAST_INSERT_ID()";

        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@fecha", body.FechaHora));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@ubicacion", body.Ubicacion));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", body.NombreEstadio));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@eqA", body.EquipoLocal));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@paisA", body.PaisEquipoLocal));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@eqB", body.EquipoVisitante));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@paisB", body.PaisEquipoVisitante));

        try
        {
            var id = Convert.ToInt32(cmd.ExecuteScalar());
            return Results.Created($"/api/eventos/{id}", new { id });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1452)
        {
            return Results.BadRequest(new { mensaje = "Estadio o equipo no existe" });
        }
    }

    private static async Task<IResult> Update(int id, HttpContext http, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var body = await http.Request.ReadFromJsonAsync<CreateEventoRequest>();
        if (body is null)
            return Results.BadRequest(new { mensaje = "Cuerpo inválido" });

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            UPDATE Evento
            SET fecha_hora = @fecha, ubicacion = @ubicacion,
                nombre_estadio = @estadio,
                nombre_equipo_a = @eqA, pais_equipo_a = @paisA,
                nombre_equipo_b = @eqB, pais_equipo_b = @paisB
            WHERE id_evento = @id";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@fecha", body.FechaHora));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@ubicacion", body.Ubicacion));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@estadio", body.NombreEstadio));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@eqA", body.EquipoLocal));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@paisA", body.PaisEquipoLocal));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@eqB", body.EquipoVisitante));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@paisB", body.PaisEquipoVisitante));

        int rows = cmd.ExecuteNonQuery();
        if (rows == 0)
            return Results.NotFound(new { mensaje = "Evento no encontrado" });

        return Results.Ok(new { id });
    }

    private static async Task<IResult> Delete(int id, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM Evento WHERE id_evento = @id";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));

        int rows = cmd.ExecuteNonQuery();
        if (rows == 0)
            return Results.NotFound(new { mensaje = "Evento no encontrado" });

        return Results.NoContent();
    }

    private static async Task<IResult> GetSectoresHabilitados(int idEvento, IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT s.id_sector, s.nombre, s.capacidad_maxima, ehs.asientos_disponibles, ehs.precio
            FROM EventoHabilitaSector ehs
            JOIN Sector s ON s.id_sector = ehs.id_sector AND s.nombre_estadio = ehs.nombre_estadio
            WHERE ehs.id_evento = @id
            ORDER BY s.nombre";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", idEvento));

        using var reader = cmd.ExecuteReader();
        var sectores = new List<object>();
        while (reader.Read())
        {
            sectores.Add(new
            {
                idSector = reader.GetInt32(0),
                nombre = reader.GetString(1),
                capacidadMaxima = reader.GetInt32(2),
                asientosDisponibles = reader.GetInt32(3),
                precio = reader.GetDecimal(4)
            });
        }

        return Results.Ok(sectores);
    }

    private static async Task<IResult> HabilitarSector(int idEvento, HttpContext http, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var body = await http.Request.ReadFromJsonAsync<HabilitarSectorRequest>();
        if (body is null)
            return Results.BadRequest(new { mensaje = "Cuerpo inválido" });

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO EventoHabilitaSector (id_evento, id_sector, nombre_estadio)
            VALUES (@idEvento, @idSector, @nombreEstadio)";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idEvento", idEvento));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idSector", body.IdSector));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nombreEstadio", body.NombreEstadio));

        try
        {
            cmd.ExecuteNonQuery();
            return Results.Created($"/api/eventos/{idEvento}/sectores-habilitados/{body.IdSector}", body);
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1062)
        {
            return Results.Conflict(new { mensaje = "El sector ya está habilitado para este evento" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1452)
        {
            return Results.BadRequest(new { mensaje = "Evento o sector no existe" });
        }
    }

    private static async Task<IResult> DeshabilitarSector(int idEvento, int idSector, IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var check = conn.CreateCommand();
        check.CommandText = @"
            SELECT ehs.asientos_disponibles, s.capacidad_maxima
            FROM EventoHabilitaSector ehs
            JOIN Sector s ON s.id_sector = ehs.id_sector AND s.nombre_estadio = ehs.nombre_estadio
            WHERE ehs.id_evento = @idEvento AND ehs.id_sector = @idSector";
        check.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idEvento", idEvento));
        check.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idSector", idSector));

        using var reader = check.ExecuteReader();
        if (!reader.Read())
            return Results.NotFound(new { mensaje = "Sector no habilitado para este evento" });

        var disponibles = reader.GetInt32(0);
        var capacidad = reader.GetInt32(1);
        reader.Close();

        if (disponibles != capacidad)
            return Results.Conflict(new { mensaje = "No se puede deshabilitar un sector con entradas vendidas" });

        var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM EventoHabilitaSector WHERE id_evento = @idEvento AND id_sector = @idSector";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idEvento", idEvento));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idSector", idSector));

        cmd.ExecuteNonQuery();
        return Results.NoContent();
    }
}

public record CreateEventoRequest(
    DateTime FechaHora,
    string Ubicacion,
    string NombreEstadio,
    string EquipoLocal,
    string PaisEquipoLocal,
    string EquipoVisitante,
    string PaisEquipoVisitante
);

public record HabilitarSectorRequest(int IdSector, string NombreEstadio);
