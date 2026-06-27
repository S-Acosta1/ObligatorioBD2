import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import TicketCard from "./TicketCard";
import { formatDate } from "./homeData";

export default function Entradas({ initialView = "held" }) {
  const {
    currentUser,
    purchasedTickets = [],
    heldTickets = [],
    pendingReceivedTransfers = [],
    transferHistory = [],
    onTransferTicket,
    onAcceptTransfer,
    onRejectTransfer,
    onNotify,
  } = useOutletContext();
  const [ticketView, setTicketView] = useState(initialView);

  return (
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

      {ticketView === "pending" ? (
        pendingReceivedTransfers.length > 0 ? (
          <div className="home-ticketGrid">
            {pendingReceivedTransfers.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isPendingTransfer
                pendingDirection={`Solicitud recibida de ${ticket.pendingTransfer.fromName}`}
                onAcceptTransfer={onAcceptTransfer}
                onRejectTransfer={onRejectTransfer}
                onNotify={onNotify}
              />
            ))}
          </div>
        ) : (
          <div className="home-empty home-empty--tickets">No tenés transferencias pendientes por aceptar.</div>
        )
      ) : ticketView === "purchased" ? (
        purchasedTickets.length > 0 ? (
          <div className="home-ticketGrid">
            {purchasedTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onTransferTicket={onTransferTicket} onNotify={onNotify} />
            ))}
          </div>
        ) : (
          <div className="home-empty home-empty--tickets">Todavía no realizaste compras con esta cuenta.</div>
        )
      ) : ticketView === "history" ? (
        transferHistory.length > 0 ? (
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
        )
      ) : (
        heldTickets.length > 0 ? (
          <div className="home-ticketGrid">
            {heldTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                canTransfer
                onTransferTicket={onTransferTicket}
                onNotify={onNotify}
              />
            ))}
          </div>
        ) : (
          <div className="home-empty home-empty--tickets">No tenés entradas en tu poder en este momento.</div>
        )
      )}
    </section>
  );
}
