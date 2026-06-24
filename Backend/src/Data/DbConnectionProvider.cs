using MySql.Data.MySqlClient;
using System.Data;

namespace ObligatorioAPI.Data;

internal sealed class DbConnectionProvider
{
    private readonly string _baseConnectionString;
    private readonly IReadOnlyDictionary<string, (string User, string Password)> _users;

    public DbConnectionProvider(IConfiguration configuration)
    {
        _baseConnectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        _users = configuration.GetSection("DatabaseUsers")
            .GetChildren()
            .ToDictionary(
                section => section.Key,
                section => (
                    User: section["User"] ?? "",
                    Password: section["Password"] ?? ""
                ));
    }

    public IDbConnection CreateConnection()
    {
        return CreateConnection(null);
    }

    public IDbConnection CreateConnection(string? userKey)
    {
        if (userKey == null)
            return new MySqlConnection(_baseConnectionString);

        var builder = new MySqlConnectionStringBuilder(_baseConnectionString);

        if (_users.TryGetValue(userKey, out var creds))
        {
            builder.UserID = creds.User;
            builder.Password = creds.Password;
        }

        return new MySqlConnection(builder.ConnectionString);
    }
}
