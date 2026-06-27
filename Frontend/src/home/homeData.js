export function formatDate(dateValue) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short", day: "2-digit", month: "short",
  }).format(new Date(`${dateValue}T00:00:00`));
}
