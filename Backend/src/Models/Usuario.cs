namespace ObligatorioAPI.Models;

public class Usuario
{
    public string Email { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string HashContra { get; set; } = string.Empty;
    public string TipoDocumento { get; set; } = string.Empty;
    public string NumeroDocumento { get; set; } = string.Empty;
    public string CodPaisDocumento { get; set; } = string.Empty;
    public int IdDireccion { get; set; }
    public string CodPaisDireccion { get; set; } = string.Empty;
}
