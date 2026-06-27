import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getEventos, crearEvento, modificarEvento, habilitarSector, fetchPaises, getEquipos, getEstadios } from "../api";

const emptyForm = {
  fechaHora: "",
  ubicacion: "",
  nombreEstadio: "",
  equipoLocal: "",
  paisEquipoLocal: "",
  equipoVisitante: "",
  paisEquipoVisitante: ""
};

export default function AdminEventos() {
  const { onNotify } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [paises, setPaises] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [estadios, setEstadios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalForm, setModalForm] = useState(emptyForm);

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

  function openAddModal() {
    setEditingId(null);
    setModalForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(event) {
    setEditingId(event.id);
    setModalForm({
      fechaHora: event.fechaHora ? event.fechaHora.slice(0, 16) : "",
      ubicacion: event.ubicacion || "",
      nombreEstadio: event.estadio || "",
      equipoLocal: event.equipoLocal || "",
      paisEquipoLocal: event.paisEquipoLocal || "",
      equipoVisitante: event.equipoVisitante || "",
      paisEquipoVisitante: event.paisEquipoVisitante || ""
    });
    setShowModal(true);
  }

  async function save() {
    const { fechaHora, ubicacion, nombreEstadio, equipoLocal, paisEquipoLocal, equipoVisitante, paisEquipoVisitante } = modalForm;
    if (!fechaHora || !ubicacion || !nombreEstadio || !equipoLocal || !paisEquipoLocal || !equipoVisitante || !paisEquipoVisitante) {
      onNotify?.("Completá todos los campos del evento.", "error");
      return;
    }
    const payload = {
      ...modalForm,
      fechaHora: fechaHora.includes("T") ? `${fechaHora}:00` : fechaHora
    };
    try {
      if (editingId !== null) {
        await modificarEvento(editingId, payload);
        onNotify?.("Evento modificado con éxito.", "success");
      } else {
        await crearEvento(payload);
        onNotify?.("Evento creado con éxito.", "success");
      }
      setShowModal(false);
      load();
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  async function sector(id, estadio) {
    try {
      await habilitarSector({
        idEvento: id,
        idSector: 1,
        nombreEstadio: estadio
      });
      onNotify?.("Sector habilitado con éxito.", "success");
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  return (
    <section className="admin-page-section">
      <div className="admin-eventos-header">
        <h1>Administrar eventos</h1>
        <button className="admin-actionButton" onClick={openAddModal}>
          + Agregar evento
        </button>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2>{editingId !== null ? "Editar evento" : "Nuevo evento"}</h2>
            <label className="admin-field">
              Fecha y hora
              <input className="admin-input" type="datetime-local"
                value={modalForm.fechaHora}
                onChange={e => setModalForm({ ...modalForm, fechaHora: e.target.value })} />
            </label>
            <label className="admin-field">
              Ubicación
              <input className="admin-input" placeholder="Ej: Estadio Centenario"
                value={modalForm.ubicacion}
                onChange={e => setModalForm({ ...modalForm, ubicacion: e.target.value })} />
            </label>
            <label className="admin-field">
              Estadio
              <select className="admin-input"
                value={modalForm.nombreEstadio}
                onChange={e => setModalForm({ ...modalForm, nombreEstadio: e.target.value })}>
                <option value="">Seleccionar estadio</option>
                {estadios.map(e => (
                  <option key={e.nombre} value={e.nombre}>{e.nombre}</option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              Equipo local
              <select className="admin-input"
                value={modalForm.equipoLocal}
                onChange={e => setModalForm({ ...modalForm, equipoLocal: e.target.value })}>
                <option value="">Seleccionar equipo local</option>
                {equipos.filter(e => e.nombre !== modalForm.equipoVisitante).map(e => (
                  <option key={e.nombre} value={e.nombre}>{e.nombre}</option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              País del equipo local
              <select className="admin-input"
                value={modalForm.paisEquipoLocal}
                onChange={e => setModalForm({ ...modalForm, paisEquipoLocal: e.target.value })}>
                <option value="">Seleccionar país local</option>
                {paises.map(p => (
                  <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              Equipo visitante
              <select className="admin-input"
                value={modalForm.equipoVisitante}
                onChange={e => setModalForm({ ...modalForm, equipoVisitante: e.target.value })}>
                <option value="">Seleccionar equipo visitante</option>
                {equipos.filter(e => e.nombre !== modalForm.equipoLocal).map(e => (
                  <option key={e.nombre} value={e.nombre}>{e.nombre}</option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              País del equipo visitante
              <select className="admin-input"
                value={modalForm.paisEquipoVisitante}
                onChange={e => setModalForm({ ...modalForm, paisEquipoVisitante: e.target.value })}>
                <option value="">Seleccionar país visitante</option>
                {paises.map(p => (
                  <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                ))}
              </select>
            </label>
            <div className="admin-modal-actions">
              <button className="admin-actionButton admin-actionButton--secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="admin-actionButton" onClick={save}>
                {editingId !== null ? "Guardar cambios" : "Crear evento"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="admin-list">
        {events.map(event => (
          <article className="admin-list-item" key={event.id}>
            <div>
              <h3>{event.equipoLocal} vs {event.equipoVisitante}</h3>
              <p>{event.estadio}</p>
            </div>
            <div className="admin-list-actions">
              <button className="admin-list-button admin-list-button--edit" onClick={() => openEditModal(event)}>
                Editar
              </button>
              <button onClick={() => sector(event.id, event.estadio)}>Habilitar sector</button>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
