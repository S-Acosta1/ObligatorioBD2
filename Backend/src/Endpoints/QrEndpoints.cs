using System.Security.Claims;
using ObligatorioAPI.Data;
using ObligatorioAPI.Services;

namespace ObligatorioAPI.Endpoints;

public static class QrEndpoints
{
    public static void MapQrEndpoints(this WebApplication app)
    {
        app.MapGet("/api/entradas/{id:int}/qr", GetQrCode).RequireAuthorization("UsuarioOnly");
    }

    private static IResult GetQrCode(int id, HttpContext http, IUsuarioLecturaDatabase db, QrCodeService qr)
    {
        var email = http.User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
            return Results.Unauthorized();

        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT email_usuario FROM Entrada WHERE id_entrada = @id";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id", id));

        var holder = cmd.ExecuteScalar();
        if (holder == null || (string)holder != email)
            return Results.Forbid();

        var codigo = qr.GetCurrentCode(id);
        return Results.Ok(new { codigo });
    }
}
