import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const cards = [
    { title: "Eventos", desc: "Crear eventos, modificar partidos y habilitar sectores.", label: "Administrar", path: "/admin/eventos" },
    { title: "Configuración", desc: "Gestionar estadios, equipos, sectores y dispositivos.", label: "Administrar", path: "/admin/config" },
    { title: "Funcionarios", desc: "Alta, baja, modificación y asignación de funcionarios.", label: "Administrar", path: "/admin/config" },
    { title: "Reportes", desc: "Ranking de compradores y eventos con mayores ventas.", label: "Ver reportes", path: "/admin/reportes" },
  ];

  return (
    <>
      <section className="admin-hero">
        <div className="admin-heroCopy">
          <p className="admin-kicker">Panel Administrativo</p>
          <h1 className="admin-title">Bienvenido</h1>
          <p className="admin-description">
            Desde aquí podrás administrar eventos, configuración del sistema y consultar reportes.
          </p>

          <div className="admin-heroStats">
            <article>
              <strong>0</strong>
              <span>Usuarios</span>
            </article>
            <article>
              <strong>0</strong>
              <span>Eventos</span>
            </article>
            <article>
              <strong>0</strong>
              <span>Entradas</span>
            </article>
            <article>
              <strong>$0</strong>
              <span>Ventas</span>
            </article>
          </div>
        </div>
      </section>

      <section className="admin-cards">
        {cards.map((card) => (
          <article className="admin-card" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.desc}</p>
            <button type="button" onClick={() => navigate(card.path)}>
              {card.label}
            </button>
          </article>
        ))}
      </section>
    </>
  );
}
