import { getToken } from "./token.js";

const API_URL="http://localhost:5167/api";

async function request(url,options={}){
	const response=await fetch(`${API_URL}${url}`,{
		...options,
		headers:{
			"Content-Type":"application/json",
			Authorization:`Bearer ${getToken()}`,
			...(options.headers||{})
		}
	});

	if(!response.ok){
		const error=await response.text();
		throw new Error(error||"Error en la petición");
	}

	return response.status===204?null:response.json();
}


// FUNCIONARIOS

export function getFuncionarios(){
	return request("/funcionarios");
}

export function crearFuncionario(data){
	return request("/funcionarios",{
		method:"POST",
		body:JSON.stringify(data)
	});
}

export function eliminarFuncionario(email){
	return request(`/funcionarios/${email}`,{
		method:"DELETE"
	});
}

export function modificarFuncionario(email,data){
	return request(`/funcionarios/${email}`,{
		method:"PUT",
		body:JSON.stringify(data)
	});
}


// ASIGNACIONES

export function asignarFuncionario(data){
	return request("/asignaciones",{
		method:"POST",
		body:JSON.stringify(data)
	});
}

export function desasignarFuncionario(data){
	return request("/asignaciones",{
		method:"DELETE",
		body:JSON.stringify(data)
	});
}


// EVENTOS

export function getEventos(){
	return request("/eventos");
}

export function crearEvento(data){
	return request("/eventos",{
		method:"POST",
		body:JSON.stringify(data)
	});
}

export function modificarEvento(id,data){
	return request(`/eventos/${id}`,{
		method:"PUT",
		body:JSON.stringify(data)
	});
}

export function eliminarEvento(id){
	return request(`/eventos/${id}`,{
		method:"DELETE"
	});
}

export function getSectoresHabilitados(idEvento){
	return request(`/eventos/${idEvento}/sectores-habilitados`);
}

export function habilitarSector(data){
	return request(`/eventos/${data.idEvento}/sectores-habilitados`,{
		method:"POST",
		body:JSON.stringify(data)
	});
}

export function deshabilitarSector(idEvento,idSector){
	return request(`/eventos/${idEvento}/sectores-habilitados/${idSector}`,{
		method:"DELETE"
	});
}


// EQUIPOS

export function getEquipos(){
	return request("/equipos");
}

export function crearEquipo(data){
	return request("/equipos",{
		method:"POST",
		body:JSON.stringify(data)
	});
}

export function modificarEquipo(nombre,codPais,data){
	return request(`/equipos/${nombre}/${codPais}`,{
		method:"PUT",
		body:JSON.stringify(data)
	});
}

export function eliminarEquipo(nombre,codPais){
	return request(`/equipos/${nombre}/${codPais}`,{
		method:"DELETE"
	});
}


// ESTADIOS

export function getEstadios(){
	return request("/estadios");
}

export function crearEstadio(data){
	return request("/estadios",{
		method:"POST",
		body:JSON.stringify(data)
	});
}

export function modificarEstadio(nombre,data){
	return request(`/estadios/${nombre}`,{
		method:"PUT",
		body:JSON.stringify(data)
	});
}

export function eliminarEstadio(nombre){
	return request(`/estadios/${nombre}`,{
		method:"DELETE"
	});
}


// SECTORES

export function getSectores(nombreEstadio){
	return request(`/estadios/${nombreEstadio}/sectores`);
}

export function crearSector(nombreEstadio,data){
	return request(`/estadios/${nombreEstadio}/sectores`,{
		method:"POST",
		body:JSON.stringify(data)
	});
}

export function modificarSector(nombreEstadio,idSector,data){
	return request(`/estadios/${nombreEstadio}/sectores/${idSector}`,{
		method:"PUT",
		body:JSON.stringify(data)
	});
}

export function eliminarSector(nombreEstadio,idSector){
	return request(`/estadios/${nombreEstadio}/sectores/${idSector}`,{
		method:"DELETE"
	});
}


// ESCANERS

export function getEscaners(){
	return request("/escaners");
}

export function crearEscaner(data){
	return request("/escaners",{
		method:"POST",
		body:JSON.stringify(data)
	});
}

export function eliminarEscaner(id,nombreEstadio){
	return request(`/escaners/${id}/${nombreEstadio}`,{
		method:"DELETE"
	});
}


// REPORTES

export function getRankingCompradores(){
	return request("/reportes/ranking-compradores");
}

export function getEventosMayorVenta(){
	return request("/reportes/eventos-mayores-ventas");
}