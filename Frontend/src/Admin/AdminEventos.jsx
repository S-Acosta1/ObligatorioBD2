import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getEventos, crearEvento, habilitarSector, fetchPaises, getEquipos, getEstadios } from "../api";

export default function AdminEventos() {
  const { onNotify } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [paises, setPaises] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [estadios, setEstadios] = useState([]);
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

  useEffect(() => {
    fetchPaises().then(setPaises).catch(() => {});
    getEquipos().then(setEquipos).catch(() => {});
    getEstadios().then(setEstadios).catch(() => {});
  }, []);

  async function load() {
    try {
      const data = await getEventos();
      setEvents(data);
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  async function create() {
    if (!form.fechaHora || !form.ubicacion || !form.nombreEstadio || !form.equipoLocal || !form.paisEquipoLocal || !form.equipoVisitante || !form.paisEquipoVisitante) {
      onNotify?.("Completá todos los campos del evento.", "error");
      return;
    }
    try {
      await crearEvento(form);
      onNotify?.("Evento creado con éxito.", "success");
      setForm({
        fechaHora: "",
        ubicacion: "",
        nombreEstadio: "",
        equipoLocal: "",
        paisEquipoLocal: "",
        equipoVisitante: "",
        paisEquipoVisitante: ""
      });
      load();
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  async function sector(id) {
    if (!form.nombreEstadio) {
      onNotify?.("Seleccioná un estadio primero.", "error");
      return;
    }
    try {
      await habilitarSector({
        idEvento: id,
        idSector: 1,
        nombreEstadio: form.nombreEstadio
      });
      onNotify?.("Sector habilitado con éxito.", "success");
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  return (
    <section className="admin-page-section">
      <h1>Administrar eventos</h1>
      <input className="admin-input" placeholder="Fecha y hora"
        value={form.fechaHora}
        onChange={e => setForm({ ...form, fechaHora: e.target.value })} />
      <input className="admin-input" placeholder="Ubicación"
        value={form.ubicacion}
        onChange={e => setForm({ ...form, ubicacion: e.target.value })} />
      <select className="admin-input"
        value={form.nombreEstadio}
        onChange={e => setForm({ ...form, nombreEstadio: e.target.value })}>
        <option value="">Seleccionar estadio</option>
        {estadios.map(e => (
          <option key={e.nombre} value={e.nombre}>{e.nombre}</option>
        ))}
      </select>
      <select className="admin-input"
        value={form.equipoLocal}
        onChange={e => setForm({ ...form, equipoLocal: e.target.value })}>
        <option value="">Seleccionar equipo local</option>
        {equipos.map(e => (
          <option key={e.nombre} value={e.nombre}>{e.nombre}</option>
        ))}
      </select>
      <select className="admin-input"
        value={form.paisEquipoLocal}
        onChange={e => setForm({ ...form, paisEquipoLocal: e.target.value })}>
        <option value="">Seleccionar país local</option>
        {paises.map(p => (
          <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
        ))}
      </select>
      <select className="admin-input"
        value={form.equipoVisitante}
        onChange={e => setForm({ ...form, equipoVisitante: e.target.value })}>
        <option value="">Seleccionar equipo visitante</option>
        {equipos.map(e => (
          <option key={e.nombre} value={e.nombre}>{e.nombre}</option>
        ))}
      </select>
      <select className="admin-input"
        value={form.paisEquipoVisitante}
        onChange={e => setForm({ ...form, paisEquipoVisitante: e.target.value })}>
        <option value="">Seleccionar país visitante</option>
        {paises.map(p => (
          <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
        ))}
      </select>
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
