using ObligatorioAPI.Data;
using ObligatorioAPI.Models;

namespace ObligatorioAPI.Endpoints;

public static class PaisEndpoints
{
    public static void MapPaisEndpoints(this WebApplication app)
    {
        app.MapGet("/api/paises", GetAll);
        app.MapGet("/api/paises/{codigo}", GetByCodigo);
    }

    private static async Task<IResult> GetAll(IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT codigo, nombre FROM Pais";

        using var reader = cmd.ExecuteReader();

        var paises = new List<Pais>();
        while (reader.Read())
        {
            paises.Add(new Pais
            {
                Codigo = reader.GetString(0),
                Nombre = reader.GetString(1)
            });
        }

        return Results.Ok(paises);
    }

    private static async Task<IResult> GetByCodigo(string codigo, IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT codigo, nombre FROM Pais WHERE codigo = @codigo";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@codigo", codigo));

        using var reader = cmd.ExecuteReader();

        if (!reader.Read())
            return Results.NotFound(new { mensaje = "País no encontrado" });

        return Results.Ok(new Pais
        {
            Codigo = reader.GetString(0),
            Nombre = reader.GetString(1)
        });
    }
}
