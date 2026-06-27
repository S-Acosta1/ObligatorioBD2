import {useState} from "react";
import HomeA from "./HomeA";
import WorkerDashboard from "./WorkerDashboard";
import UserDashboard from "./UserDashboard";
import AdminEventos from "../Admin/AdminEventos";
import AdminConfiguracion from "../Admin/AdminConfiguracion";
import AdminReportes from "../Admin/AdminReportes";

export default function Dashboard({role,onLogout}){

	const [adminSection,setAdminSection]=useState("home");

	if(role==="admin"){

		if(adminSection==="eventos"){
			return(
				<AdminEventos
					onBack={()=>setAdminSection("home")}
				/>
			);
		}

		if(adminSection==="config"){
			return(
				<AdminConfiguracion
					onBack={()=>setAdminSection("home")}
				/>
			);
		}

		if(adminSection==="reportes"){
			return(
				<AdminReportes
					onBack={()=>setAdminSection("home")}
				/>
			);
		}

		return(
			<HomeA
				currentUser={JSON.parse(localStorage.getItem("user"))}
				stats={{
					users:0,
					matches:0,
					tickets:0,
					sales:0
				}}
				onUsers={()=>setAdminSection("config")}
				onMatches={()=>setAdminSection("eventos")}
				onReports={()=>setAdminSection("reportes")}
				onConfiguration={()=>setAdminSection("config")}
				onLogout={onLogout}
			/>
		);
	}

	if(role==="funcionario"){
		return <WorkerDashboard onLogout={onLogout}/>;
	}

	return <UserDashboard onLogout={onLogout}/>;
}