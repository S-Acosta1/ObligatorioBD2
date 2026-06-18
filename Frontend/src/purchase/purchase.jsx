import { useState } from "react";
import "./purchase.css";

export default function Purchase({ selectedMatch, onBackToHome, onConfirmPurchase, onNotify }) {
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState("general");
  const [documentType, setDocumentType] = useState("dni_ci");
  const [documentNumber, setDocumentNumber] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const quantityOptions = [1, 2, 3, 4, 5];
  const documentMaxLength = documentType === "passport" ? 12 : 8;

  const sanitizeDocumentNumber = (value, type) => {
    if (type === "passport") {
      return value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
    }

    return value.replace(/\D/g, "").slice(0, 8);
  };

  if (!selectedMatch) {
    return null;
  }

  const basePrice = selectedMatch.price;
  const ticketMultiplier = ticketType === "vip" ? 1.6 : ticketType === "platea" ? 1.25 : 1;
  const subtotal = selectedMatch.price * quantity;
  const totalPrice = Math.round(basePrice * quantity * ticketMultiplier);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!buyerName.trim() || !buyerEmail.trim() || !documentNumber.trim()) {
      if (typeof onNotify === "function") {
        onNotify("Completá nombre, correo y documento para confirmar la compra.", "error");
      }

      return;
    }

    if (typeof onConfirmPurchase === "function") {
      onConfirmPurchase({
        matchId: selectedMatch.id,
        selection: selectedMatch.selection,
        rival: selectedMatch.rival,
        competition: selectedMatch.competition,
        stadium: selectedMatch.stadium,
        city: selectedMatch.city,
        date: selectedMatch.date,
        time: selectedMatch.time,
        basePrice: selectedMatch.price,
        quantity,
        ticketType,
        documentType,
        documentNumber,
        buyerName,
        buyerEmail,
        subtotal,
        totalPrice,
      });
    }

    if (typeof onNotify === "function") {
      onNotify("Compra realizada con éxito.", "success");
    }

    onBackToHome();
  };

  return (
    <main className="purchase-page">
      <section className="purchase-summary">
        <p className="purchase-kicker">Checkout oficial</p>
        <h1 className="purchase-title">{selectedMatch.selection} vs {selectedMatch.rival}</h1>
        <p className="purchase-description">
          Completá los datos para confirmar la compra de las entradas del partido seleccionado.
        </p>

        <div className="purchase-stepper" aria-label="Progreso de compra">
          <span className="is-active">1. Partido</span>
          <span className="is-active">2. Datos</span>
          <span>3. Confirmación</span>
        </div>

        <div className="purchase-matchbox">
          <p><strong>Competencia:</strong> {selectedMatch.competition}</p>
          <p><strong>Estadio:</strong> {selectedMatch.stadium}</p>
          <p><strong>Ciudad:</strong> {selectedMatch.city}</p>
          <p><strong>Fecha:</strong> {selectedMatch.date} · {selectedMatch.time}</p>
          <p><strong>Precio base:</strong> ${selectedMatch.price}</p>
        </div>

        <button type="button" className="purchase-back" onClick={onBackToHome}>
          Volver a partidos
        </button>
      </section>

      <section className="purchase-card">
        <div className="purchase-cardHeader">
          <h2 className="purchase-formTitle">Datos de compra</h2>
          <p>Revisá el pedido antes de confirmar.</p>
        </div>

        <form className="purchase-form" onSubmit={handleSubmit}>
          <div className="purchase-grid">
            <div className="purchase-field">
              <label>Tipo de entrada</label>
              <select value={ticketType} onChange={(e) => setTicketType(e.target.value)}>
                <option value="general">General</option>
                <option value="platea">Platea</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div className="purchase-field">
              <label>Cantidad de entradas</label>
              <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                {quantityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="purchase-field">
            <label>Nombre completo</label>
            <input
              type="text"
              placeholder="Nombre y apellido"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
            />
          </div>

          <div className="purchase-field">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="usuario@email.com"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
            />
          </div>

          <div className="purchase-grid">
            <div className="purchase-field">
              <label>Tipo de documento</label>
              <select
                value={documentType}
                onChange={(e) => {
                  const nextType = e.target.value;
                  setDocumentType(nextType);
                  setDocumentNumber((currentValue) => sanitizeDocumentNumber(currentValue, nextType));
                }}
              >
                <option value="passport">Pasaporte</option>
                <option value="dni_ci">DNI / CI</option>
              </select>
            </div>
            <div className="purchase-field">
              <label>Número de documento</label>
              <input
                type="text"
                inputMode={documentType === "passport" ? "text" : "numeric"}
                pattern={documentType === "passport" ? "[a-zA-Z0-9]*" : "[0-9]*"}
                maxLength={documentMaxLength}
                placeholder={documentType === "passport" ? "Pasaporte alfanumérico" : "DNI / CI numérico"}
                value={documentNumber}
                onChange={(e) => setDocumentNumber(sanitizeDocumentNumber(e.target.value, documentType))}
              />
            </div>
          </div>

          <div className="purchase-field">
            <label>Tarjeta</label>
            <input type="text" placeholder="0000 0000 0000 0000" />
          </div>

          <div className="purchase-grid">
            <div className="purchase-field">
              <label>Vencimiento</label>
              <input type="text" placeholder="MM/AA" />
            </div>
            <div className="purchase-field">
              <label>Nombre en la tarjeta</label>
              <input type="text" placeholder="Como figura en la tarjeta" />
            </div>
          </div>

          <div className="purchase-summaryBox">
            <div>
              <span>Subtotal</span>
              <strong>${subtotal}</strong>
            </div>
            <div>
              <span>Ajuste por tipo</span>
              <strong>{ticketType.toUpperCase()}</strong>
            </div>
            <div>
              <span>Total estimado</span>
              <strong>${totalPrice}</strong>
            </div>
          </div>

          <button type="submit" className="purchase-submit">
            Confirmar compra
          </button>
        </form>
      </section>
    </main>
  );
}