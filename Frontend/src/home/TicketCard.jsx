import { useState } from "react";
import { useNavigate } from "react-router-dom";

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${dateValue}T00:00:00`));
}

export default function TicketCard({
  ticket,
  canTransfer = false,
  isPendingTransfer = false,
  pendingDirection = "",
  onTransferTicket,
  onAcceptTransfer,
  onRejectTransfer,
  onNotify,
}) {
  const navigate = useNavigate();
  const [isTransferring, setIsTransferring] = useState(false);
  const [recipient, setRecipient] = useState("");

  const startTransfer = () => {
    navigate("/home/entradas");
    setIsTransferring(true);
  };

  const confirmTransfer = () => {
    if (!recipient.trim()) {
      onNotify?.("Ingresá un usuario o correo destino para transferir la entrada.", "error");
      return;
    }

    onTransferTicket?.(ticket.id, recipient.trim());
    setIsTransferring(false);
    setRecipient("");
  };

  return (
    <article className="ticket-card">
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
        <p><strong>Sector:</strong> {ticket.sectorName ? `Sector ${ticket.sectorName}` : ticket.ticketType?.toUpperCase()}</p>
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
            onClick={startTransfer}
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
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </label>

          <div className="ticket-card__transferActions">
            <button type="button" className="ticket-card__secondary" onClick={() => { setIsTransferring(false); setRecipient(""); }}>
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
}
