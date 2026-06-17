using ObligatorioAPI.Data;
using ObligatorioAPI.Models;

namespace ObligatorioAPI.Endpoints;

public static class EventoEndpoints
{
    public static void MapEventoEndpoints(this WebApplication app)
    {
        app.MapGet("/api/eventos/{id:int}", async (int id, DbConnectionProvider db) =>
        {
            using var conn = db.CreateConnection();
            conn.Open();

            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT e.id_evento, est.nombre AS estadio, el.nombre AS equipo_local,
                       ev.nombre AS equipo_visitante, e.fecha_hora, e.id_admin
                FROM Evento e
                JOIN Estadio est ON est.id_estadio = e.id_estadio
                JOIN Equipo el  ON el.id_equipo  = e.id_equipo_local
                JOIN Equipo ev  ON ev.id_equipo  = e.id_equipo_visitante
                WHERE e.id_evento = @id";

            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));

            using var reader = cmd.ExecuteReader();

            if (!reader.Read())
                return Results.NotFound(new { mensaje = "Evento no encontrado" });

            return Results.Ok(new EventoResponse
            {
                Id = reader.GetInt32(0),
                Estadio = reader.GetString(1),
                EquipoLocal = reader.GetString(2),
                EquipoVisitante = reader.GetString(3),
                FechaHora = reader.GetDateTime(4),
                IdAdmin = reader.GetInt32(5)
            });
        });
    }
}
