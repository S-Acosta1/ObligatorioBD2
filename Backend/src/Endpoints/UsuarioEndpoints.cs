using System.Security.Claims;
using ObligatorioAPI.Data;

namespace ObligatorioAPI.Endpoints;

public static class UsuarioEndpoints
{
    public static void MapUsuarioEndpoints(this WebApplication app)
    {
        var usuario = app.MapGroup("/api/usuarios").RequireAuthorization("UsuarioOnly");
        usuario.MapGet("/{email}", GetPerfil);
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
