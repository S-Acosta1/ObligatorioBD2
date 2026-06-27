export const matches = [
  { id: 1, selection: "Argentina", rival: "Brasil", competition: "Cuartos de final", stadium: "Estadio Azteca", city: "Ciudad de México", date: "2026-07-12", time: "19:00", price: 120 },
  { id: 2, selection: "Uruguay", rival: "Francia", competition: "Fase de grupos", stadium: "Estadio BBVA", city: "Monterrey", date: "2026-07-08", time: "16:30", price: 95 },
  { id: 3, selection: "España", rival: "Alemania", competition: "Semifinal", stadium: "SoFi Stadium", city: "Los Angeles", date: "2026-07-15", time: "21:00", price: 140 },
  { id: 4, selection: "México", rival: "Inglaterra", competition: "Octavos de final", stadium: "Estadio Akron", city: "Guadalajara", date: "2026-07-10", time: "20:45", price: 110 },
];

export const selectionOptions = ["Todas", "Argentina", "Uruguay", "España", "México"];

export function formatDate(dateValue) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short", day: "2-digit", month: "short",
  }).format(new Date(`${dateValue}T00:00:00`));
}
