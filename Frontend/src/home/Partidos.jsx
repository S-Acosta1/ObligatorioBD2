import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { formatDate } from "./homeData";

export default function Partidos() {
  const { onBuyTicket, eventos } = useOutletContext();
  const [selectionFilter, setSelectionFilter] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  const matches = useMemo(() =>
    eventos.map((e) => {
      const [date, timeFull] = e.fechaHora.split("T");
      const time = timeFull.slice(0, 5);
      return {
        id: e.id,
        selection: e.equipoLocal,
        rival: e.equipoVisitante,
        competition: "",
        stadium: e.estadio,
        city: e.ubicacion,
        date,
        time,
        price: 0,
        asientosDisponibles: e.asientosDisponibles,
      };
    }),
  [eventos]);

  const selectionOptions = useMemo(() => {
    const unique = [...new Set(eventos.map((e) => e.equipoLocal))].sort();
    return ["Todas", ...unique];
  }, [eventos]);

  const futureMatches = useMemo(() => matches.filter((match) => {
    const matchesSelection = selectionFilter === "Todas" || match.selection === selectionFilter;
    const text = `${match.selection} ${match.rival} ${match.competition} ${match.stadium} ${match.city}`.toLowerCase();
    return matchesSelection && text.includes(searchTerm.toLowerCase());
  }), [selectionFilter, searchTerm, matches]);

  return (
    <>
      <section className="home-filters" aria-label="Filtros de partidos">
        <label className="home-filterField">
          <span>Buscar partido, sede o ciudad</span>
          <input type="text" className="home-search" placeholder="Ej. México, Azteca, semifinal" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </label>
        <label className="home-filterField">
          <span>Selección</span>
          <select className="home-select" value={selectionFilter} onChange={(e) => setSelectionFilter(e.target.value)}>
            {selectionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </section>

      <section className="home-sectionHeader">
        <div>
          <p className="home-sectionKicker">Próximos partidos</p>
          <h2>Elegí el encuentro que querés ver</h2>
        </div>
        <p>{futureMatches.length} resultados encontrados</p>
      </section>

      <section className="home-matches">
        {futureMatches.map((match) => (
          <article key={match.id} className="match-card">
            <div className="match-card__top">
              <div>
                {match.competition && <p className="match-card__badge">{match.competition}</p>}
                <h2 className="match-card__title">{match.selection} vs {match.rival}</h2>
                <p className="match-card__subtitle">{formatDate(match.date)} · {match.time}</p>
              </div>
              {match.price > 0 && (
                <div className="match-card__price">
                  <span>Desde</span>
                  <strong>${match.price}</strong>
                </div>
              )}
            </div>
            <div className="match-card__details">
              <p><strong>Fecha:</strong> {formatDate(match.date)} · {match.time}</p>
              <p><strong>Estadio:</strong> {match.stadium}</p>
              <p><strong>Ciudad:</strong> {match.city}</p>
              <p><strong>Asientos disponibles:</strong> {match.asientosDisponibles}</p>
            </div>
            <div className="match-card__chips">
              <span>{match.stadium}</span>
              <span>{match.city}</span>
              <span>{match.selection}</span>
            </div>
            <button type="button" className="match-card__buy" onClick={() => onBuyTicket(match)}>Comprar entrada</button>
          </article>
        ))}
        {futureMatches.length === 0 && <div className="home-empty">No hay partidos que coincidan con el filtro seleccionado.</div>}
      </section>
    </>
  );
}
