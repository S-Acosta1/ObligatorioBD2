import { useEffect,useState } from "react";
import "../home/homeUG.css";
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
} from "../AdminAPI";

export default function AdminConfiguracion({onBack}){

	const [equipos,setEquipos]=useState([]);
	const [estadios,setEstadios]=useState([]);
	const [sectores,setSectores]=useState([]);
	const [escaners,setEscaners]=useState([]);
	const [equipo,setEquipo]=useState({
		nombre:"",
		codPais:""
	});
	const [estadio,setEstadio]=useState({
		nombre:"",
		codPais:""
	});
	const [sector,setSector]=useState({
		nombre:"",
		capacidadMaxima:""
	});
	const [estadioSector,setEstadioSector]=useState("");
	const [escaner,setEscaner]=useState({
		id:"",
		nombreEstadio:""
	});

	async function loadData(){
		try{
			setEquipos(await getEquipos());
			setEstadios(await getEstadios());
			setEscaners(await getEscaners());
		}catch(error){
			console.error(error);
		}
	}

	useEffect(()=>{
		loadData();
	},[]);

	async function addEquipo(){
		await crearEquipo(equipo);
		setEquipo({nombre:"",codPais:""});
		loadData();
	}

	async function addEstadio(){
		await crearEstadio(estadio);
		setEstadio({nombre:"",codPais:""});
		loadData();
	}

	async function cargarSectores(nombre){
		setEstadioSector(nombre);
		setSectores(await getSectores(nombre));
	}

	async function addSector(){
		await crearSector(estadioSector,sector);
		setSector({nombre:"",capacidadMaxima:""});
		cargarSectores(estadioSector);
	}

	async function addEscaner(){
		await crearEscaner({
			id:Number(escaner.id),
			nombreEstadio:escaner.nombreEstadio
		});
		setEscaner({
			id:"",
			nombreEstadio:""
		});
		loadData();
	}

	return(
		<main className="home-page">
			<section className="home-hero">
				<div className="home-heroCopy">
					<p className="home-kicker">
						Configuración del sistema
					</p>
					<h1 className="home-title">
						Administrar infraestructura
					</h1>
					<p className="home-description">
						Gestión de equipos, estadios, sectores y dispositivos.
					</p>
				</div>
				<button className="home-logout" onClick={onBack}>
					Volver
				</button>
			</section>
			<section className="home-matches">
				<article className="match-card">
					<h2>Equipos</h2>
					<input
						className="dashboard-input"
						placeholder="Nombre"
						value={equipo.nombre}
						onChange={e=>setEquipo({...equipo,nombre:e.target.value})}
					/>
					<input
						className="dashboard-input"
						placeholder="Código país"
						value={equipo.codPais}
						onChange={e=>setEquipo({...equipo,codPais:e.target.value})}
					/>
					<button
						className="match-card__buy"
						onClick={addEquipo}
					>
						Crear
					</button>
					{
						equipos.map(e=>(
							<p key={e.nombre}>
								{e.nombre} ({e.codPais})
								<button onClick={()=>eliminarEquipo(e.nombre,e.codPais)}>
									X
								</button>
							</p>
						))
					}
				</article>
				<article className="match-card">
					<h2>Estadios</h2>
					<input
						className="dashboard-input"
						placeholder="Nombre"
						value={estadio.nombre}
						onChange={e=>setEstadio({...estadio,nombre:e.target.value})}
					/>
					<input
						className="dashboard-input"
						placeholder="Código país"
						value={estadio.codPais}
						onChange={e=>setEstadio({...estadio,codPais:e.target.value})}
					/>
					<button
						className="match-card__buy"
						onClick={addEstadio}
					>
						Crear
					</button>
					{
						estadios.map(e=>(
							<p key={e.nombre}>
								{e.nombre}
								<button onClick={()=>eliminarEstadio(e.nombre)}>
									X
								</button>
							</p>
						))
					}
				</article>
				<article className="match-card">
					<h2>Sectores</h2>
					<select
						className="dashboard-input"
						onChange={e=>cargarSectores(e.target.value)}
					>
						<option>
							Seleccionar estadio
						</option>
						{
							estadios.map(e=>(
								<option key={e.nombre}>
									{e.nombre}
								</option>
							))
						}
					</select>
					<input
						className="dashboard-input"
						placeholder="Nombre sector"
						value={sector.nombre}
						onChange={e=>setSector({...sector,nombre:e.target.value})}
					/>
					<input
						className="dashboard-input"
						placeholder="Capacidad"
						type="number"
						value={sector.capacidadMaxima}
						onChange={e=>setSector({...sector,capacidadMaxima:e.target.value})}
					/>
					<button
						className="match-card__buy"
						onClick={addSector}
					>
						Crear
					</button>
					{
						sectores.map(s=>(
							<p key={s.id}>
								{s.nombre} - {s.capacidadMaxima}
							</p>
						))
					}
				</article>
				<article className="match-card">
					<h2>Escáneres</h2>
					<input
						className="dashboard-input"
						placeholder="ID"
						value={escaner.id}
						onChange={e=>setEscaner({...escaner,id:e.target.value})}
					/>
					<input
						className="dashboard-input"
						placeholder="Estadio"
						value={escaner.nombreEstadio}
						onChange={e=>setEscaner({...escaner,nombreEstadio:e.target.value})}
					/>
					<button
						className="match-card__buy"
						onClick={addEscaner}
					>
						Crear
					</button>
					{
						escaners.map(e=>(
							<p key={e.id}>
								{e.id} - {e.nombreEstadio}
								<button onClick={()=>eliminarEscaner(e.id,e.nombreEstadio)}>
									X
								</button>
							</p>
						))
					}
				</article>
			</section>
		</main>
	);
}