using System.Security.Claims;
using ObligatorioAPI.Data;

namespace ObligatorioAPI.Endpoints;

public static class CompraEndpoints
{
    public static void MapCompraEndpoints(this WebApplication app)
    {
        app.MapPost("/api/compras", CreateCompra).RequireAuthorization();
    }

    private static async Task<IResult> CreateCompra(CreateCompraRequest body, HttpContext http, IUsuarioDatabase db)
    {
        var email = http.User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email))
            return Results.Unauthorized();

        if (body.Cantidad < 1)
            return Results.BadRequest(new { mensaje = "La cantidad debe ser al menos 1" });

        using var conn = db.CreateConnection();
        conn.Open();
        using var tx = conn.BeginTransaction();

        try
        {
            var cmd = conn.CreateCommand();
            cmd.Transaction = tx;

            cmd.CommandText = @"
                SELECT precio, nombre_estadio
                FROM EventoHabilitaSector
                WHERE id_evento = @idEvento AND id_sector = @idSector";
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idEvento", body.IdEvento));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idSector", body.IdSector));

            using var reader = cmd.ExecuteReader();
            if (!reader.Read())
                return Results.NotFound(new { mensaje = "Sector no habilitado para este evento" });

            var precio = reader.GetDecimal(0);
            var nombreEstadio = reader.GetString(1);
            reader.Close();

            var montoTotal = precio * body.Cantidad;

            cmd.Parameters.Clear();

            cmd.CommandText = "SELECT COALESCE(MAX(id_compra), 0) + 1 FROM Compra";
            var idCompra = Convert.ToInt32(cmd.ExecuteScalar());

            cmd.CommandText = @"
                INSERT INTO Compra (id_compra, email_usuario, fecha, estado, monto_total)
                VALUES (@idCompra, @email, NOW(), 'CONFIRMADA', @monto)";
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idCompra", idCompra));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@email", email));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@monto", montoTotal));
            cmd.ExecuteNonQuery();
            cmd.Parameters.Clear();

            for (var i = 0; i < body.Cantidad; i++)
            {
                cmd.CommandText = @"
                    INSERT INTO Entrada (precio, estado, id_evento, id_sector, nombre_estadio, id_compra, email_usuario)
                    VALUES (0, 'VALIDA', @idEvento, @idSector, @nombreEstadio, @idCompra, @email)";
                cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idEvento", body.IdEvento));
                cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idSector", body.IdSector));
                cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nombreEstadio", nombreEstadio));
                cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@idCompra", idCompra));
                cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@email", email));
                cmd.ExecuteNonQuery();
                cmd.Parameters.Clear();
            }

            tx.Commit();

            return Results.Created($"/api/compras/{idCompra}", new { idCompra, montoTotal });
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }
}

public record CreateCompraRequest(int IdEvento, int IdSector, int Cantidad, string? CardNumber, string? CardExpiry, string? CardCvv, string? CardName, string? PostalCode);
