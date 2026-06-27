import { useEffect, useState } from "react";
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
  eliminarEscaner
} from "../api";

export default function AdminConfiguracion() {
  const [equipos, setEquipos] = useState([]);
  const [estadios, setEstadios] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [escaners, setEscaners] = useState([]);
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
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function addEquipo() {
    await crearEquipo(equipo);
    setEquipo({ nombre: "", codPais: "" });
    loadData();
  }

  async function addEstadio() {
    await crearEstadio(estadio);
    setEstadio({ nombre: "", codPais: "" });
    loadData();
  }

  async function cargarSectores(nombre) {
    setEstadioSector(nombre);
    setSectores(await getSectores(nombre));
  }

  async function addSector() {
    await crearSector(estadioSector, sector);
    setSector({ nombre: "", capacidadMaxima: "" });
    cargarSectores(estadioSector);
  }

  async function addEscaner() {
    await crearEscaner({ id: Number(escaner.id), nombreEstadio: escaner.nombreEstadio });
    setEscaner({ id: "", nombreEstadio: "" });
    loadData();
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
          <input className="admin-input" placeholder="Código país"
            value={equipo.codPais}
            onChange={e => setEquipo({ ...equipo, codPais: e.target.value })} />
          <button className="admin-actionButton" onClick={addEquipo}>Crear</button>
          <div className="admin-list">
            {equipos.map(e => (
              <div className="admin-list-item" key={e.nombre}>
                <span>{e.nombre} ({e.codPais})</span>
                <button onClick={() => eliminarEquipo(e.nombre, e.codPais)}>X</button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-form-group">
          <h2>Estadios</h2>
          <input className="admin-input" placeholder="Nombre"
            value={estadio.nombre}
            onChange={e => setEstadio({ ...estadio, nombre: e.target.value })} />
          <input className="admin-input" placeholder="Código país"
            value={estadio.codPais}
            onChange={e => setEstadio({ ...estadio, codPais: e.target.value })} />
          <button className="admin-actionButton" onClick={addEstadio}>Crear</button>
          <div className="admin-list">
            {estadios.map(e => (
              <div className="admin-list-item" key={e.nombre}>
                <span>{e.nombre}</span>
                <button onClick={() => eliminarEstadio(e.nombre)}>X</button>
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
                <button onClick={() => eliminarEscaner(e.id, e.nombreEstadio)}>X</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
