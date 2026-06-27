import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getRankingCompradores, getEventosMayorVenta } from "../api";

export default function AdminReportes() {
  const { onNotify } = useOutletContext();
  const [ranking, setRanking] = useState([]);
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        setRanking(await getRankingCompradores());
        setVentas(await getEventosMayorVenta());
      } catch (error) {
        onNotify?.(error.message, "error");
      }
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
            <span>{r.nombre}: {r.totalGastado}</span>
          </div>
        ))}
      </div>

      <h2>Eventos con más ventas</h2>
      <div className="admin-list">
        {ventas.map((e, i) => (
          <div className="admin-list-item" key={i}>
            <span>{e.equipoLocal} vs {e.equipoVisitante} — {e.entradasVendidas} entradas (${e.montoVendido})</span>
          </div>
        ))}
      </div>
    </section>
  );
}
