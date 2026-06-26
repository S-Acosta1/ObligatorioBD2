namespace ObligatorioAPI.Models;

public class Sector
{
    public int Id { get; set; }
    public string NombreEstadio { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int CapacidadMaxima { get; set; }
}
