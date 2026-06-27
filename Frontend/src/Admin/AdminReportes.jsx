import { useEffect, useState } from "react";
import { getRankingCompradores, getEventosMayorVenta } from "../api";

export default function AdminReportes() {
  const [ranking, setRanking] = useState([]);
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    async function load() {
      setRanking(await getRankingCompradores());
      setVentas(await getEventosMayorVenta());
    }
    load();
  }, []);

  return (
    <section className="admin-page-section">
      <h1>Reportes</h1>

      <h2>Ranking compradores</h2>
      <div className="admin-list">
        {ranking.map((r, i) => (
          <div className="admin-list-item" key={i}>
            <span>{r.nombre}: {r.totalCompras}</span>
          </div>
        ))}
      </div>

      <h2>Eventos con más ventas</h2>
      <div className="admin-list">
        {ventas.map((e, i) => (
          <div className="admin-list-item" key={i}>
            <span>{e.equipoLocal} vs {e.equipoVisitante}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
