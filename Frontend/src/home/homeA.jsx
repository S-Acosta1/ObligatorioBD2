import "./homeUG.css";

export default function HomeA({
    currentUser,
    stats,
    onUsers,
    onMatches,
    onTickets,
    onReports,
    onConfiguration,
    onLogout
}) {
    return (
        <main className="home-page">

            <section className="home-hero">

                <div className="home-heroCopy">
                    <p className="home-kicker">
                        Panel Administrativo
                    </p>

                    <h1 className="home-title">
                        Bienvenido {currentUser?.name}
                    </h1>

                    <p className="home-description">
                        Desde aquí podrás administrar eventos,
                        configuración del sistema y consultar reportes.
                    </p>

                    <div className="home-heroStats">

                        <article>
                            <strong>{stats.users}</strong>
                            <span>Usuarios</span>
                        </article>

                        <article>
                            <strong>{stats.matches}</strong>
                            <span>Eventos</span>
                        </article>

                        <article>
                            <strong>{stats.tickets}</strong>
                            <span>Entradas</span>
                        </article>

                        <article>
                            <strong>${stats.sales}</strong>
                            <span>Ventas</span>
                        </article>

                    </div>
                </div>

                <button
                    className="home-logout"
                    onClick={onLogout}
                >
                    Cerrar sesión
                </button>

            </section>

            <section className="home-matches">

                <article className="match-card">
                    <h2>Funcionarios</h2>

                    <p>
                        Alta, baja, modificación y asignación de funcionarios.
                    </p>

                    <button
                        className="match-card__buy"
                        onClick={onUsers}
                    >
                        Administrar
                    </button>

                </article>

                <article className="match-card">
                    <h2>Eventos</h2>

                    <p>
                        Crear eventos, modificar partidos y habilitar sectores.
                    </p>

                    <button
                        className="match-card__buy"
                        onClick={onMatches}
                    >
                        Administrar
                    </button>

                </article>

                <article className="match-card">
                    <h2>Configuración</h2>

                    <p>
                        Gestionar estadios, equipos, sectores y dispositivos.
                    </p>

                    <button
                        className="match-card__buy"
                        onClick={onConfiguration}
                    >
                        Administrar
                    </button>

                </article>

                <article className="match-card">
                    <h2>Reportes</h2>

                    <p>
                        Ranking de compradores y eventos con mayores ventas.
                    </p>

                    <button
                        className="match-card__buy"
                        onClick={onReports}
                    >
                        Ver reportes
                    </button>
                </article>
            </section>
        </main>
    );
}