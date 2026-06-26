using ObligatorioAPI.Data;

namespace ObligatorioAPI.Endpoints;

public static class AdminReportEndpoints
{
    public static void MapAdminReportEndpoints(this WebApplication app)
    {
        var admin = app.MapGroup("/api/admin/reportes").RequireAuthorization("AdminOnly");
        admin.MapGet("/ranking-compradores", RankingCompradores);
        admin.MapGet("/eventos-mayores-ventas", EventosMayoresVentas);
    }

    private static async Task<IResult> RankingCompradores(IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT u.email, u.nombre,
                   SUM(c.monto_total) AS total_gastado,
                   COUNT(c.id_compra) AS compras_realizadas
            FROM Compra c
            JOIN Usuario u ON u.email = c.email_usuario
            GROUP BY u.email, u.nombre
            ORDER BY total_gastado DESC
            LIMIT 10";

        using var reader = cmd.ExecuteReader();
        var ranking = new List<object>();
        while (reader.Read())
        {
            ranking.Add(new
            {
                email = reader.GetString(0),
                nombre = reader.GetString(1),
                totalGastado = reader.GetDecimal(2),
                comprasRealizadas = reader.GetInt32(3)
            });
        }

        return Results.Ok(ranking);
    }

    private static async Task<IResult> EventosMayoresVentas(IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT ev.id_evento, ev.fecha_hora, ev.ubicacion,
                   el.nombre AS equipo_local,
                   ev2.nombre AS equipo_visitante,
                   est.nombre AS estadio,
                   COUNT(e.id_entrada) AS entradas_vendidas
            FROM Evento ev
            JOIN Entrada e ON e.id_evento = ev.id_evento
            JOIN Equipo el ON el.nombre = ev.nombre_equipo_a AND el.cod_pais = ev.pais_equipo_a
            JOIN Equipo ev2 ON ev2.nombre = ev.nombre_equipo_b AND ev2.cod_pais = ev.pais_equipo_b
            JOIN Estadio est ON est.nombre = ev.nombre_estadio
            GROUP BY ev.id_evento, ev.fecha_hora, ev.ubicacion, el.nombre, ev2.nombre, est.nombre
            ORDER BY entradas_vendidas DESC
            LIMIT 10";

        using var reader = cmd.ExecuteReader();
        var eventos = new List<object>();
        while (reader.Read())
        {
            eventos.Add(new
            {
                id = reader.GetInt32(0),
                fechaHora = reader.GetDateTime(1),
                ubicacion = reader.GetString(2),
                equipoLocal = reader.GetString(3),
                equipoVisitante = reader.GetString(4),
                estadio = reader.GetString(5),
                entradasVendidas = reader.GetInt32(6)
            });
        }

        return Results.Ok(eventos);
    }
}
