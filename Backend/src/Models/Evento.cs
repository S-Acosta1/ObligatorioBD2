namespace ObligatorioAPI.Models;

public class Evento
{
    public int Id { get; set; }
    public string Estadio { get; set; } = string.Empty;
    public string EquipoLocal { get; set; } = string.Empty;
    public string EquipoVisitante { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; }
    public int IdAdmin { get; set; }
}
