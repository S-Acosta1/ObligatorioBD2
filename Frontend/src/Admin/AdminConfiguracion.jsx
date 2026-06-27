import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  getEquipos,
  crearEquipo,
  eliminarEquipo,
  getEstadios,
  crearEstadio,
  eliminarEstadio,
  getSectores,
  crearSector,
  getEscaners,
  crearEscaner,
  eliminarEscaner,
  fetchPaises
} from "../api";

export default function AdminConfiguracion() {
  const { onNotify } = useOutletContext();
  const [equipos, setEquipos] = useState([]);
  const [estadios, setEstadios] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [escaners, setEscaners] = useState([]);
  const [paises, setPaises] = useState([]);
  const [equipo, setEquipo] = useState({ nombre: "", codPais: "" });
  const [estadio, setEstadio] = useState({ nombre: "", codPais: "" });
  const [sector, setSector] = useState({ nombre: "", capacidadMaxima: "" });
  const [estadioSector, setEstadioSector] = useState("");
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

  async function addEquipo() {
    if (!equipo.nombre.trim() || !equipo.codPais) {
      onNotify?.("Completá todos los campos del equipo.", "error");
      return;
    }
    try {
      await crearEquipo(equipo);
      onNotify?.("Equipo creado con éxito.", "success");
      setEquipo({ nombre: "", codPais: "" });
      loadData();
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  async function addEstadio() {
    if (!estadio.nombre.trim() || !estadio.codPais) {
      onNotify?.("Completá todos los campos del estadio.", "error");
      return;
    }
    try {
      await crearEstadio(estadio);
      onNotify?.("Estadio creado con éxito.", "success");
      setEstadio({ nombre: "", codPais: "" });
      loadData();
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  async function cargarSectores(nombre) {
    if (!nombre) return;
    setEstadioSector(nombre);
    try {
      setSectores(await getSectores(nombre));
    } catch (error) {
      onNotify?.(error.message, "error");
    }
  }

  async function addSector() {
    if (!estadioSector || !sector.nombre.trim() || !sector.capacidadMaxima.trim()) {
      onNotify?.("Completá todos los campos del sector.", "error");
      return;
    }
    try {
      await crearSector(estadioSector, sector);
      onNotify?.("Sector creado con éxito.", "success");
      setSector({ nombre: "", capacidadMaxima: "" });
      cargarSectores(estadioSector);
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

  async function handleEliminarEquipo(nombre, codPais) {
    try {
      await eliminarEquipo(nombre, codPais);
      onNotify?.("Equipo eliminado con éxito.", "success");
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
          <input className="admin-input" placeholder="Nombre"
            value={equipo.nombre}
            onChange={e => setEquipo({ ...equipo, nombre: e.target.value })} />
          <select className="admin-input"
            value={equipo.codPais}
            onChange={e => setEquipo({ ...equipo, codPais: e.target.value })}>
            <option value="">Seleccionar país</option>
            {paises.map(p => (
              <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
            ))}
          </select>
          <button className="admin-actionButton" onClick={addEquipo}>Crear</button>
          <div className="admin-list">
            {equipos.map(e => (
              <div className="admin-list-item" key={e.nombre}>
                <span>{e.nombre} ({e.codPais})</span>
                <button onClick={() => handleEliminarEquipo(e.nombre, e.codPais)}>X</button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-form-group">
          <h2>Estadios</h2>
          <input className="admin-input" placeholder="Nombre"
            value={estadio.nombre}
            onChange={e => setEstadio({ ...estadio, nombre: e.target.value })} />
          <select className="admin-input"
            value={estadio.codPais}
            onChange={e => setEstadio({ ...estadio, codPais: e.target.value })}>
            <option value="">Seleccionar país</option>
            {paises.map(p => (
              <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
            ))}
          </select>
          <button className="admin-actionButton" onClick={addEstadio}>Crear</button>
          <div className="admin-list">
            {estadios.map(e => (
              <div className="admin-list-item" key={e.nombre}>
                <span>{e.nombre}</span>
                <button onClick={() => handleEliminarEstadio(e.nombre)}>X</button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-form-group">
          <h2>Sectores</h2>
          <select className="admin-select"
            onChange={e => cargarSectores(e.target.value)}>
            <option>Seleccionar estadio</option>
            {estadios.map(e => (
              <option key={e.nombre}>{e.nombre}</option>
            ))}
          </select>
          <input className="admin-input" placeholder="Nombre sector"
            value={sector.nombre}
            onChange={e => setSector({ ...sector, nombre: e.target.value })} />
          <input className="admin-input" placeholder="Capacidad" type="number"
            value={sector.capacidadMaxima}
            onChange={e => setSector({ ...sector, capacidadMaxima: e.target.value })} />
          <button className="admin-actionButton" onClick={addSector}>Crear</button>
          <div className="admin-list">
            {sectores.map(s => (
              <div className="admin-list-item" key={s.id}>
                <span>{s.nombre} - {s.capacidadMaxima}</span>
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
    </section>
  );
}
