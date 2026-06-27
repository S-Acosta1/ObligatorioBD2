import { useEffect, useState } from "react";
import { getEventos, crearEvento, habilitarSector } from "../AdminAPI";

export default function AdminEventos() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    fechaHora: "",
    ubicacion: "",
    nombreEstadio: "",
    equipoLocal: "",
    paisEquipoLocal: "",
    equipoVisitante: "",
    paisEquipoVisitante: ""
  });

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getEventos();
    setEvents(data);
  }

  async function create() {
    await crearEvento(form);
    load();
  }

  async function sector(id) {
    await habilitarSector({
      idEvento: id,
      idSector: 1,
      nombreEstadio: form.nombreEstadio
    });
  }

  return (
    <section className="admin-page-section">
      <h1>Administrar eventos</h1>
      <input className="admin-input" placeholder="Fecha y hora"
        onChange={e => setForm({ ...form, fechaHora: e.target.value })} />
      <input className="admin-input" placeholder="Ubicación"
        onChange={e => setForm({ ...form, ubicacion: e.target.value })} />
      <input className="admin-input" placeholder="Estadio"
        onChange={e => setForm({ ...form, nombreEstadio: e.target.value })} />
      <input className="admin-input" placeholder="Equipo local"
        onChange={e => setForm({ ...form, equipoLocal: e.target.value })} />
      <input className="admin-input" placeholder="País local"
        onChange={e => setForm({ ...form, paisEquipoLocal: e.target.value })} />
      <input className="admin-input" placeholder="Equipo visitante"
        onChange={e => setForm({ ...form, equipoVisitante: e.target.value })} />
      <input className="admin-input" placeholder="País visitante"
        onChange={e => setForm({ ...form, paisEquipoVisitante: e.target.value })} />
      <button className="admin-actionButton" onClick={create}>
        Crear evento
      </button>
      <section className="admin-list">
        {events.map(event => (
          <article className="admin-list-item" key={event.id}>
            <div>
              <h3>{event.equipoLocal} vs {event.equipoVisitante}</h3>
              <p>{event.estadio}</p>
            </div>
            <button onClick={() => sector(event.id)}>Habilitar sector</button>
          </article>
        ))}
      </section>
    </section>
  );
}
