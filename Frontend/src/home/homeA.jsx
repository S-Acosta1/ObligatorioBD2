import "./homeUG.css";

export default function HomeA({
    currentUser,
    stats,
    onUsers,
    onMatches,
    onTickets,
    onReports,
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
                        Desde aquí podrás administrar usuarios,
                        partidos, entradas y consultar reportes.
                    </p>

                    <div className="home-heroStats">

                        <article>
                            <strong>{stats.users}</strong>
                            <span>Usuarios</span>
                        </article>

                        <article>
                            <strong>{stats.matches}</strong>
                            <span>Partidos</span>
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
                    <h2>Usuarios</h2>

                    <p>
                        Alta, baja y modificación de usuarios.
                    </p>

                    <button
                        className="match-card__buy"
                        onClick={onUsers}
                    >
                        Administrar
                    </button>

                </article>

                <article className="match-card">
                    <h2>Partidos</h2>

                    <p>
                        Gestionar encuentros del Mundial.
                    </p>

                    <button
                        className="match-card__buy"
                        onClick={onMatches}
                    >
                        Administrar
                    </button>

                </article>

                <article className="match-card">
                    <h2>Entradas</h2>

                    <p>
                        Consultar disponibilidad y ventas.
                    </p>

                    <button
                        className="match-card__buy"
                        onClick={onTickets}
                    >
                        Administrar
                    </button>

                </article>

                <article className="match-card">
                    <h2>Reportes</h2>

                    <p>
                        Estadísticas del sistema.
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