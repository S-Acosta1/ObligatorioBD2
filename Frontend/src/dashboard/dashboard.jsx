import { useMemo, useState } from "react";
import "./dashboard.css";

const workerProfile = {
	name: "Mariana López",
	email: "mariana.lopez@eventos.gob",
	identifier: "FUNC-2026-041",
	event: {
		name: "Argentina vs Brasil",
		date: "2026-07-12",
		time: "19:00",
		stadium: "Estadio Azteca",
		city: "Ciudad de México",
	},
	assignedSectors: ["A", "C", "D"],
	scannerCode: "SCAN-AZ-8842",
};

const adminEventsSeed = [
	{
		id: 1,
		name: "Argentina vs Brasil",
		stadium: "Estadio Azteca",
		city: "Ciudad de México",
		date: "2026-07-12",
		time: "19:00",
		soldTickets: 48210,
		capacity: 52000,
		attended: 0,
		sectors: ["A", "B", "C", "D"],
	},
	{
		id: 2,
		name: "España vs Alemania",
		stadium: "SoFi Stadium",
		city: "Los Angeles",
		date: "2026-07-15",
		time: "21:00",
		soldTickets: 43120,
		capacity: 45000,
		attended: 0,
		sectors: ["A", "E", "F"],
	},
	{
		id: 3,
		name: "México vs Inglaterra",
		stadium: "Estadio Akron",
		city: "Guadalajara",
		date: "2026-07-10",
		time: "20:45",
		soldTickets: 38400,
		capacity: 42000,
		attended: 0,
		sectors: ["B", "C", "G"],
	},
];

const workerSeed = [
	{ id: 1, name: "Mariana López", email: "mariana.lopez@eventos.gob", event: "Argentina vs Brasil", sector: "A", status: "Activo" },
	{ id: 2, name: "Andrés Vega", email: "andres.vega@eventos.gob", event: "España vs Alemania", sector: "E", status: "Activo" },
	{ id: 3, name: "Lucía Gómez", email: "lucia.gomez@eventos.gob", event: "México vs Inglaterra", sector: "B", status: "Pendiente" },
];

const emptyWorkerForm = {
	name: "",
	email: "",
	eventId: "1",
	sector: "A",
};

function formatDate(dateValue) {
	return new Intl.DateTimeFormat("es-ES", {
		weekday: "short",
		day: "2-digit",
		month: "short",
	}).format(new Date(`${dateValue}T00:00:00`));
}

function WorkerDashboard({ onLogout }) {
	const [sectorProgress, setSectorProgress] = useState(() =>
		workerProfile.assignedSectors.reduce((accumulator, sector) => {
			accumulator[sector] = false;
			return accumulator;
		}, {}),
	);

	const coveredCount = Object.values(sectorProgress).filter(Boolean).length;
	const totalCount = workerProfile.assignedSectors.length;

	const toggleSector = (sector) => {
		setSectorProgress((currentProgress) => ({
			...currentProgress,
			[sector]: !currentProgress[sector],
		}));
	};

	return (
		<main className="dashboard-page dashboard-page--worker">
			<section className="dashboard-hero">
				<div>
					<p className="dashboard-kicker">Panel de funcionario</p>
					<h1 className="dashboard-title">Controlá tu evento, tus sectores y tu escáner asignado.</h1>
					<p className="dashboard-description">
						Vista operativa enfocada en cobertura por sector y trazabilidad de trabajo.
					</p>
				</div>
				<button type="button" className="dashboard-logout" onClick={onLogout}>
					Cerrar sesión
				</button>
			</section>

			<section className="dashboard-metrics">
				<article className="dashboard-metricCard">
					<span>Escáner</span>
					<strong>{workerProfile.scannerCode}</strong>
				</article>
				<article className="dashboard-metricCard">
					<span>Sector cubiertos</span>
					<strong>{coveredCount}/{totalCount}</strong>
				</article>
				<article className="dashboard-metricCard">
					<span>Legajo</span>
					<strong>{workerProfile.identifier}</strong>
				</article>
			</section>

			<section className="dashboard-grid">
				<article className="dashboard-card">
					<p className="dashboard-cardLabel">Evento asignado</p>
					<h2>{workerProfile.event.name}</h2>
					<p>{formatDate(workerProfile.event.date)} · {workerProfile.event.time}</p>
					<p>{workerProfile.event.stadium} · {workerProfile.event.city}</p>
				</article>

				<article className="dashboard-card">
					<p className="dashboard-cardLabel">Sectores asignados</p>
					<div className="dashboard-chipRow">
						{workerProfile.assignedSectors.map((sector) => (
							<span key={sector} className="dashboard-chip">Sector {sector}</span>
						))}
					</div>
				</article>
			</section>

			<section className="dashboard-card dashboard-progressCard">
				<div className="dashboard-cardHeader">
					<div>
						<p className="dashboard-cardLabel">Seguimiento de cobertura</p>
						<h2>Marcá cada sector cuando termines el trabajo</h2>
					</div>
					<p>{Math.round((coveredCount / totalCount) * 100)}% completado</p>
				</div>

				<div className="dashboard-progressBar" aria-hidden="true">
					<span style={{ width: `${(coveredCount / totalCount) * 100}%` }} />
				</div>

				<div className="dashboard-sectorList">
					{workerProfile.assignedSectors.map((sector) => {
						const isCovered = sectorProgress[sector];

						return (
							<div key={sector} className="dashboard-sectorItem">
								<div>
									<strong>Sector {sector}</strong>
									<span>{isCovered ? "Cubierto" : "Pendiente"}</span>
								</div>
								<button type="button" className="dashboard-sectorButton" onClick={() => toggleSector(sector)}>
									{isCovered ? "Desmarcar" : "Marcar como cubierto"}
								</button>
							</div>
						);
					})}
				</div>
			</section>
		</main>
	);
}

function AdminDashboard({ onLogout }) {
	const [events, setEvents] = useState(adminEventsSeed);
	const [workers, setWorkers] = useState(workerSeed);
	const [newWorker, setNewWorker] = useState(emptyWorkerForm);
	const [selectedEventId, setSelectedEventId] = useState("1");
	const [selectedSector, setSelectedSector] = useState("A");
	const [selectedWorkerId, setSelectedWorkerId] = useState("1");

	const totals = useMemo(() => {
		const soldTickets = events.reduce((sum, event) => sum + event.soldTickets, 0);
		const capacity = events.reduce((sum, event) => sum + event.capacity, 0);
		const attendance = events.reduce((sum, event) => sum + event.attended, 0);
		return {
			soldTickets,
			capacity,
			attendance,
			occupancy: capacity === 0 ? 0 : Math.round((soldTickets / capacity) * 100),
		};
	}, [events]);

	const assignWorker = () => {
		setEvents((currentEvents) =>
			currentEvents.map((event) =>
				event.id === Number(selectedEventId)
					? {
						...event,
						sectors: event.sectors.includes(selectedSector) ? event.sectors : [...event.sectors, selectedSector],
					}
					: event,
			),
		);

		setWorkers((currentWorkers) =>
			currentWorkers.map((worker) =>
				worker.id === Number(selectedWorkerId)
					? {
						...worker,
						event: events.find((event) => event.id === Number(selectedEventId))?.name || worker.event,
						sector: selectedSector,
						status: "Asignado",
					}
					: worker,
			),
		);
	};

	const createWorker = () => {
		if (!newWorker.name.trim() || !newWorker.email.trim()) {
			return;
		}

		const targetEvent = events.find((event) => event.id === Number(newWorker.eventId));

		setWorkers((currentWorkers) => [
			...currentWorkers,
			{
				id: Date.now(),
				name: newWorker.name.trim(),
				email: newWorker.email.trim(),
				event: targetEvent?.name || "Sin evento",
				sector: newWorker.sector,
				status: "Activo",
			},
		]);
		setNewWorker(emptyWorkerForm);
	};

	return (
		<main className="dashboard-page dashboard-page--admin">
			<section className="dashboard-hero">
				<div>
					<p className="dashboard-kicker">Panel de administrador</p>
					<h1 className="dashboard-title">Control de ventas, asistencia, eventos y funcionarios.</h1>
					<p className="dashboard-description">
						Vista de gestión para seguimiento operativo y asignación de personal por sector.
					</p>
				</div>
				<button type="button" className="dashboard-logout" onClick={onLogout}>
					Cerrar sesión
				</button>
			</section>

			<section className="dashboard-metrics dashboard-metrics--admin">
				<article className="dashboard-metricCard">
					<span>Entradas vendidas</span>
					<strong>{totals.soldTickets.toLocaleString("es-ES")}</strong>
				</article>
				<article className="dashboard-metricCard">
					<span>Capacidad total</span>
					<strong>{totals.capacity.toLocaleString("es-ES")}</strong>
				</article>
				<article className="dashboard-metricCard">
					<span>Asistencia registrada</span>
					<strong>{totals.attendance.toLocaleString("es-ES")}</strong>
				</article>
				<article className="dashboard-metricCard">
					<span>Ocupación</span>
					<strong>{totals.occupancy}%</strong>
				</article>
			</section>

			<section className="dashboard-grid dashboard-grid--admin">
				<article className="dashboard-card">
					<p className="dashboard-cardLabel">Crear funcionario</p>
					<div className="dashboard-form">
						<input className="dashboard-input" type="text" placeholder="Nombre completo" value={newWorker.name} onChange={(e) => setNewWorker((current) => ({ ...current, name: e.target.value }))} />
						<input className="dashboard-input" type="email" placeholder="Correo institucional" value={newWorker.email} onChange={(e) => setNewWorker((current) => ({ ...current, email: e.target.value }))} />
						<div className="dashboard-formRow">
							<select className="dashboard-input" value={newWorker.eventId} onChange={(e) => setNewWorker((current) => ({ ...current, eventId: e.target.value }))}>
								{events.map((event) => (
									<option key={event.id} value={event.id}>{event.name}</option>
								))}
							</select>
							<select className="dashboard-input" value={newWorker.sector} onChange={(e) => setNewWorker((current) => ({ ...current, sector: e.target.value }))}>
								{["A", "B", "C", "D", "E", "F", "G", "H"].map((sector) => (
									<option key={sector} value={sector}>Sector {sector}</option>
								))}
							</select>
						</div>
						<button type="button" className="dashboard-actionButton" onClick={createWorker}>
							Crear funcionario
						</button>
					</div>
				</article>

				<article className="dashboard-card">
					<p className="dashboard-cardLabel">Asignar funcionario</p>
					<div className="dashboard-form">
						<select className="dashboard-input" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
							{events.map((event) => (
								<option key={event.id} value={event.id}>{event.name}</option>
							))}
						</select>
						<select className="dashboard-input" value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}>
							{["A", "B", "C", "D", "E", "F", "G", "H"].map((sector) => (
								<option key={sector} value={sector}>Sector {sector}</option>
							))}
						</select>
						<select className="dashboard-input" value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)}>
							{workers.map((worker) => (
								<option key={worker.id} value={worker.id}>{worker.name}</option>
							))}
						</select>
						<button type="button" className="dashboard-actionButton" onClick={assignWorker}>
							Asignar funcionario al sector
						</button>
					</div>
				</article>
			</section>

			<section className="dashboard-card dashboard-eventsCard">
				<div className="dashboard-cardHeader">
					<div>
						<p className="dashboard-cardLabel">Seguimiento de eventos</p>
						<h2>Venta, asistencia y personal asignado</h2>
					</div>
					<p>{events.length} eventos activos</p>
				</div>

				<div className="dashboard-eventList">
					{events.map((event) => {
						const occupancy = Math.round((event.soldTickets / event.capacity) * 100);

						return (
							<article key={event.id} className="dashboard-eventItem">
								<div className="dashboard-eventTop">
									<div>
										<h3>{event.name}</h3>
										<p>{formatDate(event.date)} · {event.time}</p>
										<p>{event.stadium} · {event.city}</p>
									</div>
									<div className="dashboard-eventStat">
										<span>Ocupación</span>
										<strong>{occupancy}%</strong>
									</div>
								</div>

								<div className="dashboard-inlineStats">
									<span>Vendidas: {event.soldTickets.toLocaleString("es-ES")}</span>
									<span>Capacidad: {event.capacity.toLocaleString("es-ES")}</span>
									<span>Asistencia: {event.attended.toLocaleString("es-ES")}</span>
								</div>

								<div className="dashboard-chipRow">
									{event.sectors.map((sector) => (
										<span key={sector} className="dashboard-chip">Sector {sector}</span>
									))}
								</div>
							</article>
						);
					})}
				</div>
			</section>

			<section className="dashboard-card dashboard-workersCard">
				<div className="dashboard-cardHeader">
					<div>
						<p className="dashboard-cardLabel">Funcionarios registrados</p>
						<h2>Vista individual por funcionario</h2>
					</div>
					<p>{workers.length} funcionarios</p>
				</div>

				<div className="dashboard-workerList">
					{workers.map((worker) => (
						<article key={worker.id} className="dashboard-workerItem">
							<div>
								<h3>{worker.name}</h3>
								<p>{worker.email}</p>
							</div>
							<div>
								<strong>{worker.event}</strong>
								<span>Sector {worker.sector} · {worker.status}</span>
							</div>
						</article>
					))}
				</div>
			</section>
		</main>
	);
}

export default function Dashboard({ role, onLogout }) {
	if (role === "admin") {
		return <AdminDashboard onLogout={onLogout} />;
	}

	return <WorkerDashboard onLogout={onLogout} />;
}