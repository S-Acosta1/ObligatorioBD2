using System.Security.Claims;
using ObligatorioAPI.Data;

namespace ObligatorioAPI.Endpoints;

public static class UsuarioEndpoints
{
    public static void MapUsuarioEndpoints(this WebApplication app)
    {
        var usuario = app.MapGroup("/api/usuarios").RequireAuthorization("UsuarioOnly");
        usuario.MapGet("/{email}", GetPerfil);
        usuario.MapGet("/{email}/entradas", GetEntradas);
        usuario.MapGet("/{email}/compras", GetCompras);

        app.MapGet("/api/usuarios/buscar/{email}", BuscarUsuario).RequireAuthorization();
    }

    private static async Task<IResult> GetEntradas(string email, HttpContext http, IUsuarioLecturaDatabase db)
    {
        var currentEmail = http.User.FindFirstValue(ClaimTypes.Email);
        if (currentEmail != email)
            return Results.Forbid();

        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT e.id_entrada, e.precio, e.estado, e.id_evento, e.id_sector, e.nombre_estadio,
                   e.id_compra, e.email_usuario AS current_holder,
                   c.email_usuario AS purchased_by, c.monto_total,
                   ev.fecha_hora, ev.ubicacion, ev.nombre_equipo_a, ev.nombre_equipo_b,
                   s.nombre AS sector_nombre,
                   uh.nombre AS holder_nombre,
                   ub.nombre AS buyer_nombre,
                   td.nombre AS holder_doc_tipo,
                   uh.numero_documento AS holder_doc_numero,
                   (SELECT u.nombre
                    FROM Transferencia t
                    JOIN TransferenciaContieneEntrada tce ON tce.id_transferencia = t.id_transferencia
                    JOIN Usuario u ON u.email = t.email_usuario_recibe
                    WHERE tce.id_entrada = e.id_entrada AND t.estado = 'ACEPTADA'
                    ORDER BY t.id_transferencia DESC
                    LIMIT 1) AS ultimo_destinatario
            FROM Entrada e
            JOIN Compra c ON c.id_compra = e.id_compra
            JOIN Evento ev ON ev.id_evento = e.id_evento
            JOIN Sector s ON s.id_sector = e.id_sector AND s.nombre_estadio = e.nombre_estadio
            JOIN Usuario uh ON uh.email = e.email_usuario
            JOIN Usuario ub ON ub.email = c.email_usuario
            JOIN TipoDocumento td ON td.id_tipo = uh.tipo_documento
            WHERE e.email_usuario = @email
            ORDER BY ev.fecha_hora DESC";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@email", email));

        using var reader = cmd.ExecuteReader();
        var entradas = new List<object>();
        while (reader.Read())
        {
            entradas.Add(new
            {
                id = reader.GetInt32(0),
                precio = reader.GetDecimal(1),
                estado = reader.GetString(2),
                idEvento = reader.GetInt32(3),
                idSector = reader.GetInt32(4),
                nombreEstadio = reader.GetString(5),
                idCompra = reader.GetInt32(6),
                currentHolderEmail = reader.GetString(7),
                purchasedByEmail = reader.GetString(8),
                montoTotal = reader.GetDecimal(9),
                fechaHora = reader.GetDateTime(10),
                ubicacion = reader.GetString(11),
                equipoLocal = reader.GetString(12),
                equipoVisitante = reader.GetString(13),
                sectorNombre = reader.GetString(14),
                holderNombre = reader.GetString(15),
                buyerNombre = reader.GetString(16),
                holderDocTipo = reader.GetString(17),
                holderDocNumero = reader.GetString(18),
                ultimoDestinatario = reader.IsDBNull(19) ? null : reader.GetString(19),
            });
        }

        return Results.Ok(entradas);
    }

    private static async Task<IResult> GetCompras(string email, HttpContext http, IUsuarioLecturaDatabase db)
    {
        var currentEmail = http.User.FindFirstValue(ClaimTypes.Email);
        if (currentEmail != email)
            return Results.Forbid();

        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT e.id_entrada, e.precio, e.estado, e.id_evento, e.id_sector, e.nombre_estadio,
                   e.id_compra, e.email_usuario AS current_holder,
                   c.email_usuario AS purchased_by, c.monto_total,
                   ev.fecha_hora, ev.ubicacion, ev.nombre_equipo_a, ev.nombre_equipo_b,
                   s.nombre AS sector_nombre,
                   uh.nombre AS holder_nombre,
                   ub.nombre AS buyer_nombre,
                   td.nombre AS holder_doc_tipo,
                   uh.numero_documento AS holder_doc_numero,
                   (SELECT u.nombre
                    FROM Transferencia t
                    JOIN TransferenciaContieneEntrada tce ON tce.id_transferencia = t.id_transferencia
                    JOIN Usuario u ON u.email = t.email_usuario_recibe
                    WHERE tce.id_entrada = e.id_entrada AND t.estado = 'ACEPTADA'
                    ORDER BY t.id_transferencia DESC
                    LIMIT 1) AS ultimo_destinatario
            FROM Entrada e
            JOIN Compra c ON c.id_compra = e.id_compra
            JOIN Evento ev ON ev.id_evento = e.id_evento
            JOIN Sector s ON s.id_sector = e.id_sector AND s.nombre_estadio = e.nombre_estadio
            JOIN Usuario uh ON uh.email = e.email_usuario
            JOIN Usuario ub ON ub.email = c.email_usuario
            JOIN TipoDocumento td ON td.id_tipo = uh.tipo_documento
            WHERE c.email_usuario = @email
            ORDER BY ev.fecha_hora DESC";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@email", email));

        using var reader = cmd.ExecuteReader();
        var entradas = new List<object>();
        while (reader.Read())
        {
            entradas.Add(new
            {
                id = reader.GetInt32(0),
                precio = reader.GetDecimal(1),
                estado = reader.GetString(2),
                idEvento = reader.GetInt32(3),
                idSector = reader.GetInt32(4),
                nombreEstadio = reader.GetString(5),
                idCompra = reader.GetInt32(6),
                currentHolderEmail = reader.GetString(7),
                purchasedByEmail = reader.GetString(8),
                montoTotal = reader.GetDecimal(9),
                fechaHora = reader.GetDateTime(10),
                ubicacion = reader.GetString(11),
                equipoLocal = reader.GetString(12),
                equipoVisitante = reader.GetString(13),
                sectorNombre = reader.GetString(14),
                holderNombre = reader.GetString(15),
                buyerNombre = reader.GetString(16),
                holderDocTipo = reader.GetString(17),
                holderDocNumero = reader.GetString(18),
                ultimoDestinatario = reader.IsDBNull(19) ? null : reader.GetString(19),
            });
        }

        return Results.Ok(entradas);
    }

    private static async Task<IResult> BuscarUsuario(string email, IUsuarioLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT email, nombre FROM Usuario WHERE email = @email";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@email", email));

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
            return Results.NotFound(new { mensaje = "Usuario no encontrado" });

        return Results.Ok(new
        {
            email = reader.GetString(0),
            nombre = reader.GetString(1),
        });
    }

    private static async Task<IResult> GetPerfil(string email, HttpContext http, IUsuarioLecturaDatabase db)
    {
        var currentEmail = http.User.FindFirstValue(ClaimTypes.Email);
        if (currentEmail != email)
            return Results.Forbid();

        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT u.email, u.nombre, u.tipo_documento, u.numero_documento,
                   u.cod_pais_documento, u.cod_pais_direccion,
                   ug.estado_verificacion,
                   d.calle, d.localidad, d.codigo_postal
            FROM Usuario u
            LEFT JOIN UsuarioGeneral ug ON ug.email = u.email
            LEFT JOIN Direccion d ON d.id_direccion = u.id_direccion AND d.cod_pais = u.cod_pais_direccion
            WHERE u.email = @email";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@email", email));

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
            return Results.NotFound(new { mensaje = "Usuario no encontrado" });

        return Results.Ok(new
        {
            email = reader.GetString(0),
            nombre = reader.GetString(1),
            tipoDocumento = reader.GetString(2),
            numeroDocumento = reader.GetString(3),
            codPaisDocumento = reader.GetString(4),
            codPaisDireccion = reader.GetString(5),
            estadoVerificacion = reader.IsDBNull(6) ? null : reader.GetString(6),
            calle = reader.IsDBNull(7) ? null : reader.GetString(7),
            localidad = reader.IsDBNull(8) ? null : reader.GetString(8),
            codigoPostal = reader.IsDBNull(9) ? null : reader.GetString(9),
        });
    }
}
