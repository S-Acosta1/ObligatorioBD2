using ObligatorioAPI.Data;
using ObligatorioAPI.Models;

namespace ObligatorioAPI.Endpoints;

public static class TipoDocumentoEndpoints
{
    public static void MapTipoDocumentoEndpoints(this WebApplication app)
    {
        app.MapGet("/api/tipos-documento", GetAll);
    }

    private static async Task<IResult> GetAll(IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT id_tipo, nombre FROM TipoDocumento";

        using var reader = cmd.ExecuteReader();

        var tipos = new List<TipoDocumento>();
        while (reader.Read())
        {
            tipos.Add(new TipoDocumento
            {
                IdTipo = reader.GetInt32(0),
                Nombre = reader.GetString(1)
            });
        }

        return Results.Ok(tipos);
    }
}
