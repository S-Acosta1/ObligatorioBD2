import {useEffect,useState} from "react";
import {getRankingCompradores,getEventosMayorVenta} from "../api/AdminAPI";


export default function AdminReportes(){
const [ranking,setRanking]=useState([]);
const [ventas,setVentas]=useState([]);

useEffect(()=>{
async function load(){

    setRanking(await getRankingCompradores());

    setVentas(await getEventosMayorVenta());}
load();},[]);
return(
<main className="dashboard-page">
<h1>Reportes</h1>
<section className="dashboard-card">
<h2>Ranking compradores</h2>
{

ranking.map((r,i)=>(
<p key={i}>{r.nombre}: {r.totalCompras}</p>
))}
</section>

<section className="dashboard-card">
<h2>Eventos con más ventas</h2>
{ventas.map((e,i)=>(
<p key={i}>{e.equipoLocal} vs {e.equipoVisitante}</p>
))}
</section>
</main>)}