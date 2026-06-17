using MySql.Data.MySqlClient;
using System.Data;

namespace ObligatorioAPI.Data;

public class DbConnectionProvider
{
    private readonly string _connectionString;

    public DbConnectionProvider(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
    }

    public IDbConnection CreateConnection()
    {
        return new MySqlConnection(_connectionString);
    }
}
