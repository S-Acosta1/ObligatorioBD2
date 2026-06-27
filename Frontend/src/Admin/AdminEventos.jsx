import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getEventos, crearEvento, modificarEvento, habilitarSector, deshabilitarSector, actualizarPrecioSector, getSectores, getSectoresHabilitados, fetchPaises, getEquipos, getEstadios } from "../api";

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

  const [showSectorModal, setShowSectorModal] = useState(false);
  const [sectorEvent, setSectorEvent] = useState(null);
  const [stadiumSectors, setStadiumSectors] = useState([]);
  const [enabledSectors, setEnabledSectors] = useState({});
  const [sectorPrices, setSectorPrices] = useState({});
  const [sectorLoading, setSectorLoading] = useState(false);

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

  async function openSectorModal(event) {
    setSectorEvent(event);
    setShowSectorModal(true);
    setSectorLoading(true);

    try {
      const [allSectores, habilitados] = await Promise.all([
        getSectores(event.estadio),
        getSectoresHabilitados(event.id),
      ]);
      setStadiumSectors(allSectores);

      const enabledMap = {};
      const prices = {};
      habilitados.forEach(s => {
        enabledMap[s.idSector] = true;
        prices[s.idSector] = s.precio;
      });
      setEnabledSectors(enabledMap);
      setSectorPrices(prices);
    } catch (error) {
      onNotify?.(error.message, "error");
    } finally {
      setSectorLoading(false);
    }
  }

  function toggleSector(idSector) {
    setEnabledSectors(prev => ({ ...prev, [idSector]: !prev[idSector] }));
  }

  function setSectorPrice(idSector, price) {
    setSectorPrices(prev => ({ ...prev, [idSector]: price }));
  }

  async function saveSectors() {
    if (!sectorEvent) return;

    try {
      const habilitados = await getSectoresHabilitados(sectorEvent.id);
      const previouslyEnabled = {};
      habilitados.forEach(s => { previouslyEnabled[s.idSector] = s; });

      for (const sector of stadiumSectors) {
        const isNowEnabled = enabledSectors[sector.id] || false;
        const wasEnabled = previouslyEnabled[sector.id] !== undefined;
        const price = Number(sectorPrices[sector.id]) || 0;

        if (isNowEnabled && !wasEnabled) {
          await habilitarSector({
            idEvento: sectorEvent.id,
            idSector: sector.id,
            nombreEstadio: sectorEvent.estadio,
            precio: price,
          });
        } else if (!isNowEnabled && wasEnabled) {
          await deshabilitarSector(sectorEvent.id, sector.id);
        } else if (isNowEnabled && wasEnabled) {
          const oldPrice = previouslyEnabled[sector.id].precio;
          if (Number(oldPrice) !== price) {
            await actualizarPrecioSector(sectorEvent.id, sector.id, price);
          }
        }
      }

      onNotify?.("Sectores actualizados con éxito.", "success");
      setShowSectorModal(false);
      setSectorEvent(null);
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

      {showSectorModal && sectorEvent && (
        <div className="admin-modal-overlay" onClick={() => { setShowSectorModal(false); setSectorEvent(null); }}>
          <div className="admin-modal admin-modal--sectors" onClick={e => e.stopPropagation()}>
            <h2>Sectores activos — {sectorEvent.equipoLocal} vs {sectorEvent.equipoVisitante}</h2>
            <p className="admin-sectors-hint">{sectorEvent.estadio}</p>

            {sectorLoading ? (
              <p className="admin-sectors-loading">Cargando sectores...</p>
            ) : (
              <div className="admin-sectors-list">
                {stadiumSectors.map(s => (
                  <div key={s.id} className="admin-sector-row">
                    <label className="admin-sector-toggle">
                      <input type="checkbox"
                        checked={enabledSectors[s.id] || false}
                        onChange={() => toggleSector(s.id)} />
                      <span className="admin-sector-name">Sector {s.nombre}</span>
                      <span className="admin-sector-capacity">Cap. {s.capacidadMaxima}</span>
                    </label>
                    {enabledSectors[s.id] && (
                      <div className="admin-sector-price">
                        <label className="admin-field">
                          Precio ($)
                          <input className="admin-input admin-input--price" type="number" step="0.01" min="0"
                            value={sectorPrices[s.id] ?? ""}
                            onChange={e => setSectorPrice(s.id, e.target.value)} />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="admin-modal-actions">
              <button className="admin-actionButton admin-actionButton--secondary"
                onClick={() => { setShowSectorModal(false); setSectorEvent(null); }}>
                Cancelar
              </button>
              <button className="admin-actionButton" onClick={saveSectors} disabled={sectorLoading}>
                Guardar sectores
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
              <button className="admin-list-button admin-list-button--sectors" onClick={() => openSectorModal(event)}>
                Sectores
              </button>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
