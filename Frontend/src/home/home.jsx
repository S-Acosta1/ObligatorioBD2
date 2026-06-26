import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

const matches = [
  {
    id: 1,
    selection: "Argentina",
    rival: "Brasil",
    competition: "Cuartos de final",
    stadium: "Estadio Azteca",
    city: "Ciudad de México",
    date: "2026-07-12",
    time: "19:00",
    price: 120,
  },
  {
    id: 2,
    selection: "Uruguay",
    rival: "Francia",
    competition: "Fase de grupos",
    stadium: "Estadio BBVA",
    city: "Monterrey",
    date: "2026-07-08",
    time: "16:30",
    price: 95,
  },
  {
    id: 3,
    selection: "España",
    rival: "Alemania",
    competition: "Semifinal",
    stadium: "SoFi Stadium",
    city: "Los Angeles",
    date: "2026-07-15",
    time: "21:00",
    price: 140,
  },
  {
    id: 4,
    selection: "México",
    rival: "Inglaterra",
    competition: "Octavos de final",
    stadium: "Estadio Akron",
    city: "Guadalajara",
    date: "2026-07-10",
    time: "20:45",
    price: 110,
  },
];

const selectionOptions = ["Todas", "Argentina", "Uruguay", "España", "México"];

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${dateValue}T00:00:00`));
}

export default function Home({
  currentUser,
  purchasedTickets = [],
  heldTickets = [],
  pendingReceivedTransfers = [],
  transferHistory = [],
  onBuyTicket,
  onTransferTicket,
  onAcceptTransfer,
  onRejectTransfer,
  onNotify,
  onLogout,
}) {
  const navigate = useNavigate();
  const [selectionFilter, setSelectionFilter] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [showTickets, setShowTickets] = useState(false);
  const [ticketView, setTicketView] = useState("held");
  const [transferTicketId, setTransferTicketId] = useState(null);
  const [transferRecipient, setTransferRecipient] = useState("");

  const futureMatches = useMemo(() => {
    return matches.filter((match) => {
      const matchesSelection = selectionFilter === "Todas" || match.selection === selectionFilter;
      const text = `${match.selection} ${match.rival} ${match.competition} ${match.stadium} ${match.city}`.toLowerCase();
      const matchesSearch = text.includes(searchTerm.toLowerCase());
      return matchesSelection && matchesSearch;
    });
  }, [selectionFilter, searchTerm]);

  const startTransfer = (ticketId) => {
    setShowTickets(true);
    setTransferTicketId(ticketId);
    setTransferRecipient("");
  };

  const confirmTransfer = () => {
    if (!transferRecipient.trim()) {
      if (typeof onNotify === "function") {
        onNotify("Ingresá un usuario o correo destino para transferir la entrada.", "error");
      }

      return;
    }

    if (typeof onTransferTicket !== "function") {
      return;
    }

    onTransferTicket(transferTicketId, transferRecipient.trim());
    setTransferTicketId(null);
    setTransferRecipient("");
  };

  const renderTicketCard = (ticket, options = {}) => {
    const { canTransfer = false, isPendingTransfer = false, pendingDirection = "" } = options;
    const isTransferring = transferTicketId === ticket.id;

    return (
      <article key={ticket.id} className="ticket-card">
        <div className="ticket-card__top">
          <div>
            <p className="ticket-card__badge">{ticket.competition}</p>
            <h3 className="ticket-card__title">
              {ticket.selection} vs {ticket.rival}
            </h3>
            <p className="ticket-card__subtitle">
              {formatDate(ticket.date)} · {ticket.time}
            </p>
          </div>
          <div className="ticket-card__price">
            <span>Total</span>
            <strong>${ticket.totalPrice}</strong>
          </div>
        </div>

        <div className="ticket-card__details">
          <p><strong>Cantidad:</strong> {ticket.quantity}</p>
          <p><strong>Tipo:</strong> {ticket.ticketType.toUpperCase()}</p>
          <p><strong>Documento:</strong> {ticket.documentType === "passport" ? "Pasaporte" : "DNI / CI"} {ticket.documentNumber}</p>
          <p><strong>Comprador:</strong> {ticket.purchasedByName}</p>
          <p><strong>Titular actual:</strong> {ticket.currentHolder}</p>
          <p><strong>Estadio:</strong> {ticket.stadium}</p>
          <p><strong>Ciudad:</strong> {ticket.city}</p>
          {ticket.pendingTransfer && (
            <p><strong>Transferencia pendiente:</strong> {ticket.pendingTransfer.fromName} → {ticket.pendingTransfer.toName}</p>
          )}
          {pendingDirection && <p><strong>Estado:</strong> {pendingDirection}</p>}
        </div>

        {canTransfer && (
          <div className="ticket-card__actions">
            <button
              type="button"
              className="ticket-card__action"
              onClick={() => startTransfer(ticket.id)}
              disabled={Boolean(ticket.pendingTransfer)}
            >
              {ticket.pendingTransfer ? "Esperando confirmación" : "Transferir"}
            </button>
          </div>
        )}

        {isPendingTransfer && (
          <div className="ticket-card__actions">
            <button type="button" className="ticket-card__action" onClick={() => onAcceptTransfer?.(ticket.id)}>
              Aceptar transferencia
            </button>
            <button type="button" className="ticket-card__secondary" onClick={() => onRejectTransfer?.(ticket.id)}>
              Rechazar
            </button>
          </div>
        )}

        {isTransferring && (
          <div className="ticket-card__transfer">
            <label className="ticket-card__transferField">
              <span>Correo del usuario receptor</span>
              <input
                type="email"
                placeholder="usuario@correo.com"
                value={transferRecipient}
                onChange={(event) => setTransferRecipient(event.target.value)}
              />
            </label>

            <div className="ticket-card__transferActions">
              <button type="button" className="ticket-card__secondary" onClick={() => setTransferTicketId(null)}>
                Cancelar
              </button>
              <button type="button" className="ticket-card__action" onClick={confirmTransfer}>
                Enviar solicitud
              </button>
            </div>
          </div>
        )}
      </article>
    );
  };

  const renderTicketPanelContent = () => {
    if (ticketView === "pending") {
      return pendingReceivedTransfers.length > 0 ? (
        <div className="home-ticketGrid">
          {pendingReceivedTransfers.map((ticket) =>
            renderTicketCard(ticket, {
              isPendingTransfer: true,
              pendingDirection: `Solicitud recibida de ${ticket.pendingTransfer.fromName}`,
            }),
          )}
        </div>
      ) : (
        <div className="home-empty home-empty--tickets">No tenés transferencias pendientes por aceptar.</div>
      );
    }

    if (ticketView === "purchased") {
      return purchasedTickets.length > 0 ? (
        <div className="home-ticketGrid">
          {purchasedTickets.map((ticket) => renderTicketCard(ticket))}
        </div>
      ) : (
        <div className="home-empty home-empty--tickets">Todavía no realizaste compras con esta cuenta.</div>
      );
    }

    if (ticketView === "history") {
      return transferHistory.length > 0 ? (
        <div className="home-historyList">
          {transferHistory.map((movement) => (
            <article key={`${movement.ticketId}-${movement.id}`} className="home-historyItem">
              <p className="home-sectionKicker">{movement.competition}</p>
              <h3>{movement.matchName}</h3>
              <p>{formatDate(movement.date)} · {movement.time}</p>
              <p><strong>Desde:</strong> {movement.fromName} · <strong>Hacia:</strong> {movement.toName}</p>
              <p><strong>Aceptada:</strong> {new Date(movement.acceptedAt).toLocaleString("es-ES")}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="home-empty home-empty--tickets">Aún no hay transferencias aceptadas en tu historial.</div>
      );
    }

    return heldTickets.length > 0 ? (
      <div className="home-ticketGrid">
        {heldTickets.map((ticket) => renderTicketCard(ticket, { canTransfer: true }))}
      </div>
    ) : (
      <div className="home-empty home-empty--tickets">No tenés entradas en tu poder en este momento.</div>
    );
  };

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-heroCopy">
          <p className="home-kicker">Mundial 2026</p>
          <h1 className="home-title">Explorá partidos futuros y comprá entradas en segundos.</h1>
          <p className="home-description">
            Filtrá por selección específica, revisá la información de cada partido y comprá tus entradas desde una sola vista.
          </p>

          <div className="home-heroStats">
            <article>
              <strong>{futureMatches.length}</strong>
              <span>Partidos disponibles</span>
            </article>
            <article>
              <strong>3</strong>
              <span>Filtros activos</span>
            </article>
            <article>
              <strong>{heldTickets.length}</strong>
              <span>Entradas en tu poder</span>
            </article>
          </div>
        </div>

        <div className="home-heroActions">
          <button type="button" className="home-userButton" onClick={() => navigate("/profile")}>
            <span className="home-userIcon">👤</span>
            <span className="home-userName">{currentUser?.name || currentUser?.nombre || "Usuario"}</span>
          </button>
          <button type="button" className="home-logout" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </section>

      <section className="home-actions" aria-label="Acciones de entradas">
        <button type="button" className="home-actionButton home-actionButton--primary" onClick={() => setShowTickets((currentValue) => !currentValue)}>
          {showTickets ? "Ocultar mis entradas" : "Ver mis entradas"}
        </button>
        <button type="button" className="home-actionButton" onClick={() => { setShowTickets(true); setTicketView("pending"); }}>
          Transferencias pendientes ({pendingReceivedTransfers.length})
        </button>
      </section>

      <section className="home-filters" aria-label="Filtros de partidos">
        <label className="home-filterField">
          <span>Buscar partido, sede o ciudad</span>
          <input
            type="text"
            className="home-search"
            placeholder="Ej. México, Azteca, semifinal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>

        <label className="home-filterField">
          <span>Selección</span>
          <select
            className="home-select"
            value={selectionFilter}
            onChange={(e) => setSelectionFilter(e.target.value)}
          >
            {selectionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="home-sectionHeader">
        <div>
          <p className="home-sectionKicker">Próximos partidos</p>
          <h2>Elegí el encuentro que querés ver</h2>
        </div>
        <p>{futureMatches.length} resultados encontrados</p>
      </section>

      {showTickets && (
        <section className="home-ticketsPanel" aria-label="Mis entradas">
          <div className="home-ticketsPanel__header">
            <div>
              <p className="home-sectionKicker">Mis entradas</p>
              <h2>{currentUser?.name || currentUser?.nombre || "Usuario"} · gestión de entradas</h2>
            </div>
            <p>{heldTickets.length} en poder · {purchasedTickets.length} compradas</p>
          </div>

          <div className="home-ticketTabs" role="tablist" aria-label="Vistas de entradas">
            <button type="button" className={ticketView === "held" ? "is-active" : ""} onClick={() => setTicketView("held")}>
              En mi poder ({heldTickets.length})
            </button>
            <button type="button" className={ticketView === "purchased" ? "is-active" : ""} onClick={() => setTicketView("purchased")}>
              Compradas ({purchasedTickets.length})
            </button>
            <button type="button" className={ticketView === "pending" ? "is-active" : ""} onClick={() => setTicketView("pending")}>
              Por aceptar ({pendingReceivedTransfers.length})
            </button>
            <button type="button" className={ticketView === "history" ? "is-active" : ""} onClick={() => setTicketView("history")}>
              Historial ({transferHistory.length})
            </button>
          </div>

          {renderTicketPanelContent()}
        </section>
      )}

      <section className="home-matches">
        {futureMatches.map((match) => (
          <article key={match.id} className="match-card">
            <div className="match-card__top">
              <div>
                <p className="match-card__badge">{match.competition}</p>
                <h2 className="match-card__title">
                  {match.selection} vs {match.rival}
                </h2>
                <p className="match-card__subtitle">{formatDate(match.date)} · {match.time}</p>
              </div>

              <div className="match-card__price">
                <span>Desde</span>
                <strong>${match.price}</strong>
              </div>
            </div>

            <div className="match-card__details">
              <p><strong>Fecha:</strong> {formatDate(match.date)} · {match.time}</p>
              <p><strong>Estadio:</strong> {match.stadium}</p>
              <p><strong>Ciudad:</strong> {match.city}</p>
            </div>

            <div className="match-card__chips">
              <span>{match.stadium}</span>
              <span>{match.city}</span>
              <span>{match.selection}</span>
            </div>

            <button type="button" className="match-card__buy" onClick={() => onBuyTicket(match)}>
              Comprar entrada
            </button>
          </article>
        ))}

        {futureMatches.length === 0 && (
          <div className="home-empty">
            No hay partidos que coincidan con el filtro seleccionado.
          </div>
        )}
      </section>
    </main>
  );
}
