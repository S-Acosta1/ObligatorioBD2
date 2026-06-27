using System.Security.Claims;
using ObligatorioAPI.Data;

namespace ObligatorioAPI.Endpoints;

public static class TransferenciaEndpoints
{
    public static void MapTransferenciaEndpoints(this WebApplication app)
    {
        app.MapGet("/api/transferencias/pendientes-recibidas", GetPendientesRecibidas).RequireAuthorization();
        app.MapPost("/api/transferencias", CrearTransferencia).RequireAuthorization();
        app.MapPut("/api/transferencias/{id}/aceptar", AceptarTransferencia).RequireAuthorization();
        app.MapPut("/api/transferencias/{id}/rechazar", RechazarTransferencia).RequireAuthorization();
    }

    private static async Task<IResult> GetPendientesRecibidas(HttpContext http, IUsuarioLecturaDatabase db)
    {
        var email = http.User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
            return Results.Unauthorized();

        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT
                t.id_transferencia,
                t.email_usuario_origen,
                t.email_usuario_recibe,
                t.fecha_hora,
                t.estado,
                tce.id_entrada,
                e.precio,
                e.nombre_estadio,
                e.id_evento,
                e.id_sector,
                ev.fecha_hora AS evento_fecha_hora,
                ev.ubicacion,
                ev.nombre_equipo_a,
                ev.nombre_equipo_b,
                s.nombre AS sector_nombre,
                uor.nombre AS origen_nombre,
                c.monto_total,
                uh.nombre AS holder_nombre,
                ub.nombre AS buyer_nombre
            FROM Transferencia t
            JOIN TransferenciaContieneEntrada tce ON tce.id_transferencia = t.id_transferencia
            JOIN Entrada e ON e.id_entrada = tce.id_entrada
            JOIN Evento ev ON ev.id_evento = e.id_evento
            JOIN Sector s ON s.id_sector = e.id_sector AND s.nombre_estadio = e.nombre_estadio
            JOIN Usuario uor ON uor.email = t.email_usuario_origen
            JOIN Usuario uh ON uh.email = e.email_usuario
            JOIN Compra c ON c.id_compra = e.id_compra
            JOIN Usuario ub ON ub.email = c.email_usuario
            WHERE t.email_usuario_recibe = @email
              AND t.estado = 'PENDIENTE'
            ORDER BY t.fecha_hora DESC";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@email", email));

        using var reader = cmd.ExecuteReader();
        var transfers = new List<object>();
        while (reader.Read())
        {
            transfers.Add(new
            {
                idTransferencia = reader.GetInt32(0),
                emailOrigen = reader.GetString(1),
                emailRecibe = reader.GetString(2),
                fechaHora = reader.GetDateTime(3),
                estado = reader.GetString(4),
                idEntrada = reader.GetInt32(5),
                precio = reader.GetDecimal(6),
                nombreEstadio = reader.GetString(7),
                idEvento = reader.GetInt32(8),
                idSector = reader.GetInt32(9),
                eventoFechaHora = reader.GetDateTime(10),
                ubicacion = reader.GetString(11),
                equipoLocal = reader.GetString(12),
                equipoVisitante = reader.GetString(13),
                sectorNombre = reader.GetString(14),
                origenNombre = reader.GetString(15),
                montoTotal = reader.GetDecimal(16),
                holderNombre = reader.GetString(17),
                buyerNombre = reader.GetString(18),
            });
        }

        return Results.Ok(transfers);
    }

    private static async Task<IResult> CrearTransferencia(CrearTransferenciaRequest body, HttpContext http, IUsuarioDatabase db)
    {
        var email = http.User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
            return Results.Unauthorized();

        if (string.IsNullOrWhiteSpace(body.EmailRecibe))
            return Results.BadRequest(new { mensaje = "Debe especificar el usuario receptor." });

        using var conn = db.CreateConnection();
        conn.Open();
        using var tx = conn.BeginTransaction();

        try
        {
            var cmd = conn.CreateCommand();
            cmd.Transaction = tx;

            cmd.CommandText = "SELECT email_usuario FROM Entrada WHERE id_entrada = @idEntrada";
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idEntrada", body.IdEntrada));
            var holder = cmd.ExecuteScalar() as string;

            if (holder == null)
                return Results.NotFound(new { mensaje = "Entrada no encontrada." });

            if (holder != email)
                return Results.Forbid();

            if (holder == body.EmailRecibe.Trim().ToLower())
                return Results.BadRequest(new { mensaje = "No podés transferirte una entrada a tu propia cuenta." });

            cmd.Parameters.Clear();

            cmd.CommandText = "SELECT COUNT(*) FROM Usuario WHERE email = @emailRecibe";
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@emailRecibe", body.EmailRecibe.Trim().ToLower()));
            var userExists = Convert.ToInt32(cmd.ExecuteScalar()) > 0;

            if (!userExists)
                return Results.NotFound(new { mensaje = "El usuario receptor no existe." });

            cmd.Parameters.Clear();

            cmd.CommandText = "SELECT COALESCE(MAX(id_transferencia), 0) + 1 FROM Transferencia";
            var idTransferencia = Convert.ToInt32(cmd.ExecuteScalar());

            cmd.Parameters.Clear();
            cmd.CommandText = @"
                INSERT INTO Transferencia (id_transferencia, email_usuario_origen, email_usuario_recibe, fecha_hora, estado)
                VALUES (@id, @origen, @recibe, NOW(), 'PENDIENTE')";
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", idTransferencia));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@origen", email));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@recibe", body.EmailRecibe.Trim().ToLower()));
            cmd.ExecuteNonQuery();
            cmd.Parameters.Clear();

            cmd.CommandText = @"
                INSERT INTO TransferenciaContieneEntrada (id_transferencia, id_entrada)
                VALUES (@idTransf, @idEnt)";
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idTransf", idTransferencia));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idEnt", body.IdEntrada));
            cmd.ExecuteNonQuery();

            tx.Commit();

            return Results.Created($"/api/transferencias/{idTransferencia}", new { idTransferencia });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 3819)
        {
            tx.Rollback();
            return Results.BadRequest(new { mensaje = "No se pudo crear la transferencia: " + ex.Message });
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    private static async Task<IResult> AceptarTransferencia(int id, HttpContext http, IUsuarioDatabase db)
    {
        var email = http.User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
            return Results.Unauthorized();

        using var conn = db.CreateConnection();
        conn.Open();
        using var tx = conn.BeginTransaction();

        try
        {
            var cmd = conn.CreateCommand();
            cmd.Transaction = tx;

            cmd.CommandText = @"
                SELECT estado, email_usuario_recibe, id_entrada
                FROM Transferencia t
                JOIN TransferenciaContieneEntrada tce ON tce.id_transferencia = t.id_transferencia
                WHERE t.id_transferencia = @id";
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));

            using var reader = cmd.ExecuteReader();
            if (!reader.Read())
                return Results.NotFound(new { mensaje = "Transferencia no encontrada." });

            var estado = reader.GetString(0);
            var recipient = reader.GetString(1);
            var idEntrada = reader.GetInt32(2);
            reader.Close();

            if (estado != "PENDIENTE")
                return Results.BadRequest(new { mensaje = "La transferencia ya fue procesada." });

            if (recipient != email)
                return Results.Forbid();

            cmd.Parameters.Clear();
            cmd.CommandText = "UPDATE Transferencia SET estado = 'ACEPTADA' WHERE id_transferencia = @id";
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));
            cmd.ExecuteNonQuery();

            cmd.Parameters.Clear();
            cmd.CommandText = "UPDATE Entrada SET email_usuario = @recipient WHERE id_entrada = @idEntrada";
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@recipient", recipient));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idEntrada", idEntrada));
            cmd.ExecuteNonQuery();

            tx.Commit();

            return Results.Ok(new { mensaje = "Transferencia aceptada." });
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    private static async Task<IResult> RechazarTransferencia(int id, HttpContext http, IUsuarioDatabase db)
    {
        var email = http.User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
            return Results.Unauthorized();

        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT estado, email_usuario_recibe FROM Transferencia WHERE id_transferencia = @id";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
            return Results.NotFound(new { mensaje = "Transferencia no encontrada." });

        var estado = reader.GetString(0);
        var recipient = reader.GetString(1);
        reader.Close();

        if (estado != "PENDIENTE")
            return Results.BadRequest(new { mensaje = "La transferencia ya fue procesada." });

        if (recipient != email)
            return Results.Forbid();

        cmd.Parameters.Clear();
        cmd.CommandText = "UPDATE Transferencia SET estado = 'RECHAZADA' WHERE id_transferencia = @id";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));
        cmd.ExecuteNonQuery();

        return Results.Ok(new { mensaje = "Transferencia rechazada." });
    }
}

public record CrearTransferenciaRequest(int IdEntrada, string EmailRecibe);
