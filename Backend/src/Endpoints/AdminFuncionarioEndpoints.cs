using ObligatorioAPI.Data;
namespace ObligatorioAPI.Endpoints;

public static class AdminFuncionariosEndpoints
{
    public static void MapAdminFuncionariosEndpoints(this WebApplication app)
    {
        var admin = app.MapGroup("/api/admin/funcionarios").RequireAuthorization("AdminOnly");

        admin.MapGet("/", GetFuncionarios);
        admin.MapGet("/{email}/asignaciones", GetAsignacionesFuncionario);
        admin.MapPost("/", CrearFuncionario);
        admin.MapPut("/{email}", ModificarFuncionario);
        admin.MapDelete("/{email}", EliminarFuncionario);
    }

    private static async Task<IResult> GetFuncionarios(IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT
                funcionario.email_usuario       AS email,
                usuario.nombre                  AS nombre_funcionario,
                funcionario.num_legajo          AS legajo,
                asignacion.id_evento            AS id_evento,
                asignacion.id_sector            AS id_sector,
                asignacion.nombre_estadio       AS estadio
            FROM Funcionario funcionario
            JOIN Usuario usuario
                ON usuario.email = funcionario.email_usuario
            LEFT JOIN FuncionarioAsignadoEventoSector asignacion
                ON asignacion.email_funcionario = funcionario.email_usuario
            ORDER BY usuario.nombre";

        using var reader = cmd.ExecuteReader();
        var funcionarios = new List<object>();
        while (reader.Read())
        {
            funcionarios.Add(new
            {
                email    = reader.GetString(0),
                nombre   = reader.GetString(1),
                legajo   = reader.GetInt32(2),
                idEvento = reader.IsDBNull(3) ? (int?)null : reader.GetInt32(3),
                idSector = reader.IsDBNull(4) ? (int?)null : reader.GetInt32(4),
                estadio  = reader.IsDBNull(5) ? null       : reader.GetString(5)
            });
        }
        return Results.Ok(funcionarios);
    }

    private static async Task<IResult> GetAsignacionesFuncionario(
        string email,
        int id_evento,
        IAdministradorLecturaDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT
                funcionario.email_usuario       AS email,
                usuario.nombre                  AS nombre_funcionario,
                funcionario.num_legajo          AS legajo,
                asignacion.id_sector            AS id_sector,
                asignacion.nombre_estadio       AS estadio
            FROM Funcionario funcionario
            JOIN Usuario usuario
                ON usuario.email = funcionario.email_usuario
            LEFT JOIN FuncionarioAsignadoEventoSector asignacion
                ON asignacion.email_funcionario = funcionario.email_usuario
               AND asignacion.id_evento = @id_evento
            WHERE funcionario.email_usuario = @email
            ORDER BY usuario.nombre";

        var paramEvento = cmd.CreateParameter();
        paramEvento.ParameterName = "@id_evento";
        paramEvento.Value = id_evento;
        cmd.Parameters.Add(paramEvento);

        var paramEmail = cmd.CreateParameter();
        paramEmail.ParameterName = "@email";
        paramEmail.Value = email;
        cmd.Parameters.Add(paramEmail);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return Results.NotFound("Funcionario no encontrado");

        var resultado = new
        {
            email    = reader.GetString(0),
            nombre   = reader.GetString(1),
            legajo   = reader.GetInt32(2),
            idSector = reader.IsDBNull(3) ? (int?)null : reader.GetInt32(3),
            estadio  = reader.IsDBNull(4) ? null       : reader.GetString(4)
        };
        return Results.Ok(resultado);
    }

    private static async Task<IResult> CrearFuncionario(
        FuncionarioRequest request,
        IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO Funcionario (email_usuario, num_legajo)
            VALUES (@email, @num_legajo)";

        var paramEmail = cmd.CreateParameter();
        paramEmail.ParameterName = "@email";
        paramEmail.Value = request.Email;
        cmd.Parameters.Add(paramEmail);

        var paramLegajo = cmd.CreateParameter();
        paramLegajo.ParameterName = "@num_legajo";
        paramLegajo.Value = request.NumLegajo;
        cmd.Parameters.Add(paramLegajo);

       cmd.ExecuteNonQuery();
        return Results.Created($"/api/admin/funcionarios/{request.Email}", request);
    }

    private static async Task<IResult> ModificarFuncionario(
        string email,
        FuncionarioRequest request,
        IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            UPDATE Funcionario
            SET num_legajo = @num_legajo
            WHERE email_usuario = @email";

        var paramLegajo = cmd.CreateParameter();
        paramLegajo.ParameterName = "@num_legajo";
        paramLegajo.Value = request.NumLegajo;
        cmd.Parameters.Add(paramLegajo);

        var paramEmail = cmd.CreateParameter();
        paramEmail.ParameterName = "@email";
        paramEmail.Value = email;
        cmd.Parameters.Add(paramEmail);

var filas = cmd.ExecuteNonQuery();        if (filas == 0) return Results.NotFound("Funcionario no encontrado");
        return Results.Ok("Funcionario modificado correctamente");
    }

    private static async Task<IResult> EliminarFuncionario(
        string email,
        IAdministradorDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            DELETE FROM Funcionario
            WHERE email_usuario = @email";

        var paramEmail = cmd.CreateParameter();
        paramEmail.ParameterName = "@email";
        paramEmail.Value = email;
        cmd.Parameters.Add(paramEmail);

var filas = cmd.ExecuteNonQuery();        if (filas == 0) return Results.NotFound("Funcionario no encontrado");
        return Results.Ok("Funcionario eliminado correctamente");
    }
}

public record FuncionarioRequest(string Email, int NumLegajo);