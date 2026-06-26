using ObligatorioAPI.Data;
namespace ObligatorioAPI.Endpoints;

public static class AdminAsignacionesEndpoints
{
    public static void MapAdminAsignacionesEndpoints(this WebApplication app)
    {
        var admin = app.MapGroup("/api/admin/asignaciones").RequireAuthorization("AdminOnly");

        admin.MapPost("/", AsignarFuncionario);
        admin.MapDelete("/", DesasignarFuncionario);
    }

    private static async Task<IResult> AsignarFuncionario(
    AsignacionRequest request,
    IAdministradorDatabase db)
{
    using var conn = db.CreateConnection();
    conn.Open();

    var cmd = conn.CreateCommand();

    cmd.CommandText = $@"
        INSERT INTO FuncionarioAsignadoEventoSector 
        (email_funcionario, id_evento, id_sector)
        VALUES ('{request.Email}', {request.IdEvento}, {request.IdSector})";

    cmd.ExecuteNonQuery();

    return Results.Ok("Funcionario asignado correctamente");
}

    private static async Task<IResult> DesasignarFuncionario(
        AsignacionRequest request,
        IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = $@"
            DELETE FROM FuncionarioAsignadoEventoSector
            WHERE email_funcionario = '{request.Email}'
              AND id_evento = {request.IdEvento}
              AND id_sector = {request.IdSector}";

var filas = cmd.ExecuteNonQuery();
        if (filas == 0) return Results.NotFound("Asignacion no encontrada");
        return Results.Ok("Funcionario desasignado correctamente");
    }
}

public record AsignacionRequest(string Email, int IdEvento, int IdSector);