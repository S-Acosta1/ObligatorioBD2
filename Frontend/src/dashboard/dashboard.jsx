export default function Dashboard({role,onLogout}){

	return (
		<main className="dashboard-page">
			<h1>Panel de {role === "worker" ? "Funcionario" : "Usuario"}</h1>
			<button type="button" onClick={onLogout}>Cerrar sesión</button>
		</main>
	);
}