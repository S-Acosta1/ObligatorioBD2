using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ObligatorioAPI.Data;

namespace ObligatorioAPI.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/api/auth/login", Login);
        app.MapPost("/api/auth/register", Register);
    }

    private static IResult Login(LoginRequest request, IAuthDatabase db, IConfiguration config)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(request.Password))).ToLower();

        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT email, nombre FROM Usuario WHERE email = @email AND hash_contra = @hash";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@email", request.Email));
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@hash", hash));

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
            return Results.Unauthorized();

        var email = reader.GetString(0);
        var nombre = reader.GetString(1);
        reader.Close();

        var role = GetUserRole(email, db);

        var jwtKey = config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, nombre),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return Results.Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            email,
            nombre,
            role
        });
    }

    private static IResult Register(RegisterRequest request, IAuthDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        using var tx = conn.BeginTransaction();

        try
        {
            var hash = Convert.ToHexString(
                SHA256.HashData(Encoding.UTF8.GetBytes(request.Password))).ToLower();

            var cmd = conn.CreateCommand();
            cmd.Transaction = tx;

            cmd.CommandText = "INSERT INTO Documento (tipo, numero, cod_pais) VALUES (@tipo, @numero, @cod_pais)";
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@tipo", request.TipoDocumento));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@numero", request.NumeroDocumento));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@cod_pais", request.CodPaisDocumento));
            cmd.ExecuteNonQuery();
            cmd.Parameters.Clear();

            cmd.CommandText = "INSERT INTO Direccion (cod_pais, calle, localidad, codigo_postal) VALUES (@cod_pais, @calle, @localidad, @codigo_postal)";
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@cod_pais", request.CodPaisDireccion));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@calle", request.Calle));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@localidad", request.Localidad));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@codigo_postal", request.CodigoPostal));
            cmd.ExecuteNonQuery();

            cmd.CommandText = "SELECT LAST_INSERT_ID()";
            var idDireccion = Convert.ToInt32(cmd.ExecuteScalar());
            cmd.Parameters.Clear();

            cmd.CommandText = @"
                INSERT INTO Usuario (email, nombre, hash_contra,
                    tipo_documento, numero_documento, cod_pais_documento,
                    id_direccion, cod_pais_direccion)
                VALUES (@email, @nombre, @hash,
                    @tipo_doc, @num_doc, @cod_pais_doc,
                    @id_dir, @cod_pais_dir)";
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@email", request.Email));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@nombre", request.Nombre));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@hash", hash));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@tipo_doc", request.TipoDocumento));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@num_doc", request.NumeroDocumento));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@cod_pais_doc", request.CodPaisDocumento));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@id_dir", idDireccion));
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@cod_pais_dir", request.CodPaisDireccion));
            cmd.ExecuteNonQuery();
            cmd.Parameters.Clear();

            cmd.CommandText = "INSERT INTO UsuarioGeneral (email, estado_verificacion) VALUES (@email, 'PENDIENTE')";
            cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@email", request.Email));
            cmd.ExecuteNonQuery();

            tx.Commit();

            return Results.Created($"/api/usuarios/{request.Email}",
                new { mensaje = "Usuario registrado exitosamente" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1062)
        {
            tx.Rollback();
            return Results.Conflict(new { mensaje = "El email o documento ya existe" });
        }
        catch (MySql.Data.MySqlClient.MySqlException ex) when (ex.Number == 1452)
        {
            tx.Rollback();
            return Results.BadRequest(new { mensaje = "El país especificado no existe" });
        }
    }

    private static string GetUserRole(string email, IAuthDatabase db)
    {
        using var conn = db.CreateConnection();
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT COALESCE(
                (SELECT 'admin' FROM Administrador WHERE email_usuario = @email),
                (SELECT 'funcionario' FROM Funcionario WHERE email_usuario = @email),
                'usuario'
            )";
        cmd.Parameters.Add(new MySql.Data.MySqlClient.MySqlParameter("@email", email));
        return (string)cmd.ExecuteScalar()!;
    }
}

public record LoginRequest(string Email, string Password);

public record RegisterRequest(
    string Email,
    string Nombre,
    string Password,
    int TipoDocumento,
    string NumeroDocumento,
    string CodPaisDocumento,
    string CodPaisDireccion,
    string Calle,
    string Localidad,
    string CodigoPostal
);
