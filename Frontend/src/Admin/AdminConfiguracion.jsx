import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  getEquipos,
  crearEquipo,
  modificarEquipo,
  eliminarEquipo,
  getEstadios,
  crearEstadio,
  modificarEstadio,
  eliminarEstadio,
  getSectores,
  crearSector,
  modificarSector,
  eliminarSector,
  getEscaners,
  crearEscaner,
  eliminarEscaner,
  fetchPaises
} from "../api";

export default function AdminConfiguracion() {
  const { onNotify } = useOutletContext();
  const [equipos, setEquipos] = useState([]);
  const [estadios, setEstadios] = useState([]);
  const [escaners, setEscaners] = useState([]);
  const [paises, setPaises] = useState([]);

  const [showEquipoModal, setShowEquipoModal] = useState(false);
  const [equipoForm, setEquipoForm] = useState({ nombre: "", codPais: "" });
  const [equipoEditing, setEquipoEditing] = useState(null);

  const [showEstadioModal, setShowEstadioModal] = useState(false);
  const [estadioForm, setEstadioForm] = useState({ nombre: "", codPais: "" });
  const [estadioEditing, setEstadioEditing] = useState(null);

  const [showSectorModal, setShowSectorModal] = useState(false);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [sectores, setSectores] = useState([]);
  const [sectorForm, setSectorForm] = useState({ nombre: "", capacidadMaxima: "" });
  const [sectorEditing, setSectorEditing] = useState(null);

  const [escaner, setEscaner] = useState({ id: "", nombreEstadio: "" });

  async function loadData() {
    try {
      setEquipos(await getEquipos());
      setEstadios(await getEstadios());
      setEscaners(await getEscaners());
      setPaises(await fetchPaises());
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  useEffect(() => { loadData(); }, []);

  function openAddEquipo() {
    setEquipoEditing(null);
    setEquipoForm({ nombre: "", codPais: "" });
    setShowEquipoModal(true);
  }

  function openEditEquipo(e) {
    setEquipoEditing({ nombre: e.nombre, codPais: e.codPais });
    setEquipoForm({ nombre: e.nombre, codPais: e.codPais });
    setShowEquipoModal(true);
  }

  async function saveEquipo() {
    if (!equipoForm.nombre.trim() || !equipoForm.codPais) {
      onNotify?.("Completá todos los campos del equipo.", "error");
      return;
    }
    try {
      if (equipoEditing) {
        await modificarEquipo(equipoEditing.nombre, equipoEditing.codPais, equipoForm);
        onNotify?.("Equipo modificado con éxito.", "success");
      } else {
        await crearEquipo(equipoForm);
        onNotify?.("Equipo creado con éxito.", "success");
      }
      setShowEquipoModal(false);
      setEquipoEditing(null);
      setEquipoForm({ nombre: "", codPais: "" });
      loadData();
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  async function handleEliminarEquipo(nombre, codPais) {
    try {
      await eliminarEquipo(nombre, codPais);
      onNotify?.("Equipo eliminado con éxito.", "success");
      loadData();
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  function openAddEstadio() {
    setEstadioEditing(null);
    setEstadioForm({ nombre: "", codPais: "" });
    setShowEstadioModal(true);
  }

  function openEditEstadio(e) {
    setEstadioEditing({ nombre: e.nombre });
    setEstadioForm({ nombre: e.nombre, codPais: e.codPais });
    setShowEstadioModal(true);
  }

  async function saveEstadio() {
    if (!estadioForm.nombre.trim() || !estadioForm.codPais) {
      onNotify?.("Completá todos los campos del estadio.", "error");
      return;
    }
    try {
      if (estadioEditing) {
        await modificarEstadio(estadioEditing.nombre, estadioForm);
        onNotify?.("Estadio modificado con éxito.", "success");
      } else {
        await crearEstadio(estadioForm);
        onNotify?.("Estadio creado con éxito.", "success");
      }
      setShowEstadioModal(false);
      setEstadioEditing(null);
      setEstadioForm({ nombre: "", codPais: "" });
      loadData();
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  async function handleEliminarEstadio(nombre) {
    try {
      await eliminarEstadio(nombre);
      onNotify?.("Estadio eliminado con éxito.", "success");
      loadData();
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  async function openSectorModal(stadium) {
    setSelectedStadium(stadium);
    setSectorEditing(null);
    setSectorForm({ nombre: "", capacidadMaxima: "" });
    try {
      setSectores(await getSectores(stadium.nombre));
    } catch (error) {
      onNotify?.(error.message, "error");
    }
    setShowSectorModal(true);
  }

  function openAddSector() {
    setSectorEditing(null);
    setSectorForm({ nombre: "", capacidadMaxima: "" });
  }

  function openEditSector(s) {
    setSectorEditing(s.id);
    setSectorForm({ nombre: s.nombre, capacidadMaxima: String(s.capacidadMaxima) });
  }

  async function saveSector() {
    if (!selectedStadium || !sectorForm.nombre.trim() || !sectorForm.capacidadMaxima.trim()) {
      onNotify?.("Completá todos los campos del sector.", "error");
      return;
    }
    try {
      if (sectorEditing) {
        await modificarSector(selectedStadium.nombre, sectorEditing, sectorForm);
        onNotify?.("Sector modificado con éxito.", "success");
      } else {
        await crearSector(selectedStadium.nombre, sectorForm);
        onNotify?.("Sector creado con éxito.", "success");
      }
      setSectorEditing(null);
      setSectorForm({ nombre: "", capacidadMaxima: "" });
      setSectores(await getSectores(selectedStadium.nombre));
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  async function handleEliminarSector(idSector) {
    if (!selectedStadium) return;
    try {
      await eliminarSector(selectedStadium.nombre, idSector);
      onNotify?.("Sector eliminado con éxito.", "success");
      setSectores(await getSectores(selectedStadium.nombre));
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  async function addEscaner() {
    if (!escaner.id.toString().trim() || !escaner.nombreEstadio.trim()) {
      onNotify?.("Completá todos los campos del escáner.", "error");
      return;
    }
    try {
      await crearEscaner({ id: Number(escaner.id), nombreEstadio: escaner.nombreEstadio });
      onNotify?.("Escáner creado con éxito.", "success");
      setEscaner({ id: "", nombreEstadio: "" });
      loadData();
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  async function handleEliminarEscaner(id, nombreEstadio) {
    try {
      await eliminarEscaner(id, nombreEstadio);
      onNotify?.("Escáner eliminado con éxito.", "success");
      loadData();
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  return (
    <section className="admin-page-section">
      <h1>Configuración del sistema</h1>
      <p>Gestión de equipos, estadios, sectores y dispositivos.</p>

      <div className="admin-config-grid">
        <div className="admin-form-group">
          <h2>Equipos</h2>
          <button className="admin-actionButton" onClick={openAddEquipo}>+ Crear equipo</button>
          <div className="admin-list">
            {equipos.map(e => (
              <div className="admin-list-item" key={e.nombre}>
                <span>{e.nombre} ({e.codPais})</span>
                <div className="admin-list-actions">
                  <button className="admin-list-button admin-list-button--edit" onClick={() => openEditEquipo(e)}>Editar</button>
                  <button onClick={() => handleEliminarEquipo(e.nombre, e.codPais)}>X</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-form-group">
          <h2>Estadios</h2>
          <button className="admin-actionButton" onClick={openAddEstadio}>+ Crear estadio</button>
          <div className="admin-list">
            {estadios.map(e => (
              <div className="admin-list-item" key={e.nombre}>
                <span>{e.nombre}</span>
                <div className="admin-list-actions">
                  <button className="admin-list-button admin-list-button--edit" onClick={() => openEditEstadio(e)}>Editar</button>
                  <button className="admin-list-button admin-list-button--sectors" onClick={() => openSectorModal(e)}>Sectores</button>
                  <button onClick={() => handleEliminarEstadio(e.nombre)}>X</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-form-group">
          <h2>Escáneres</h2>
          <input className="admin-input" placeholder="ID"
            value={escaner.id}
            onChange={e => setEscaner({ ...escaner, id: e.target.value })} />
          <input className="admin-input" placeholder="Estadio"
            value={escaner.nombreEstadio}
            onChange={e => setEscaner({ ...escaner, nombreEstadio: e.target.value })} />
          <button className="admin-actionButton" onClick={addEscaner}>Crear</button>
          <div className="admin-list">
            {escaners.map(e => (
              <div className="admin-list-item" key={e.id}>
                <span>{e.id} - {e.nombreEstadio}</span>
                <button onClick={() => handleEliminarEscaner(e.id, e.nombreEstadio)}>X</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showEquipoModal && (
        <div className="admin-modal-overlay" onClick={() => setShowEquipoModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2>{equipoEditing ? "Editar equipo" : "Nuevo equipo"}</h2>
            <label className="admin-field">
              Nombre
              <input className="admin-input" placeholder="Nombre"
                value={equipoForm.nombre}
                onChange={e => setEquipoForm({ ...equipoForm, nombre: e.target.value })} />
            </label>
            <label className="admin-field">
              País
              <select className="admin-input"
                value={equipoForm.codPais}
                onChange={e => setEquipoForm({ ...equipoForm, codPais: e.target.value })}>
                <option value="">Seleccionar país</option>
                {paises.map(p => (
                  <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                ))}
              </select>
            </label>
            <div className="admin-modal-actions">
              <button className="admin-actionButton admin-actionButton--secondary" onClick={() => setShowEquipoModal(false)}>
                Cancelar
              </button>
              <button className="admin-actionButton" onClick={saveEquipo}>
                {equipoEditing ? "Guardar cambios" : "Crear equipo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEstadioModal && (
        <div className="admin-modal-overlay" onClick={() => setShowEstadioModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2>{estadioEditing ? "Editar estadio" : "Nuevo estadio"}</h2>
            <label className="admin-field">
              Nombre
              <input className="admin-input" placeholder="Nombre"
                value={estadioForm.nombre}
                onChange={e => setEstadioForm({ ...estadioForm, nombre: e.target.value })} />
            </label>
            <label className="admin-field">
              País
              <select className="admin-input"
                value={estadioForm.codPais}
                onChange={e => setEstadioForm({ ...estadioForm, codPais: e.target.value })}>
                <option value="">Seleccionar país</option>
                {paises.map(p => (
                  <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                ))}
              </select>
            </label>
            <div className="admin-modal-actions">
              <button className="admin-actionButton admin-actionButton--secondary" onClick={() => setShowEstadioModal(false)}>
                Cancelar
              </button>
              <button className="admin-actionButton" onClick={saveEstadio}>
                {estadioEditing ? "Guardar cambios" : "Crear estadio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSectorModal && selectedStadium && (
        <div className="admin-modal-overlay" onClick={() => setShowSectorModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2>Sectores — {selectedStadium.nombre}</h2>

            <div className="admin-sector-form">
              <input className="admin-input" placeholder="Nombre sector"
                value={sectorForm.nombre}
                onChange={e => setSectorForm({ ...sectorForm, nombre: e.target.value })} />
              <input className="admin-input" placeholder="Capacidad" type="number"
                value={sectorForm.capacidadMaxima}
                onChange={e => setSectorForm({ ...sectorForm, capacidadMaxima: e.target.value })} />
              <button className="admin-actionButton" onClick={saveSector}>
                {sectorEditing ? "Guardar" : "Agregar"}
              </button>
            </div>

            <div className="admin-list">
              {sectores.map(s => (
                <div className="admin-list-item" key={s.id}>
                  <span>{s.nombre} - {s.capacidadMaxima}</span>
                  <div className="admin-list-actions">
                    <button className="admin-list-button admin-list-button--edit" onClick={() => openEditSector(s)}>Editar</button>
                    <button onClick={() => handleEliminarSector(s.id)}>X</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-modal-actions">
              <button className="admin-actionButton admin-actionButton--secondary" onClick={() => setShowSectorModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
