using System.Data;

namespace ObligatorioAPI.Data;

public interface IDatabase
{
    IDbConnection CreateConnection();
}

public interface IUsuarioDatabase : IDatabase { }
public interface IUsuarioLecturaDatabase : IDatabase { }
public interface IFuncionarioDatabase : IDatabase { }
public interface IAdministradorDatabase : IDatabase { }
public interface IAdministradorLecturaDatabase : IDatabase { }

internal sealed class UsuarioDatabase(DbConnectionProvider provider) : IUsuarioDatabase
{
    public IDbConnection CreateConnection() => provider.CreateConnection("Usuario");
}

internal sealed class UsuarioLecturaDatabase(DbConnectionProvider provider) : IUsuarioLecturaDatabase
{
    public IDbConnection CreateConnection() => provider.CreateConnection("UsuarioLectura");
}

internal sealed class FuncionarioDatabase(DbConnectionProvider provider) : IFuncionarioDatabase
{
    public IDbConnection CreateConnection() => provider.CreateConnection("Funcionario");
}

internal sealed class AdministradorDatabase(DbConnectionProvider provider) : IAdministradorDatabase
{
    public IDbConnection CreateConnection() => provider.CreateConnection("Administrador");
}

internal sealed class AdministradorLecturaDatabase(DbConnectionProvider provider) : IAdministradorLecturaDatabase
{
    public IDbConnection CreateConnection() => provider.CreateConnection("AdministradorLectura");
}
