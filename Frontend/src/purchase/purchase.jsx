import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchEvento, fetchEventSectors } from "../api";
import "./purchase.css";

export default function Purchase({ onBackToHome, onConfirmPurchase, onNotify }) {
  const { eventId } = useParams();
  const [match, setMatch] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [loadingSectors, setLoadingSectors] = useState(true);
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

  useEffect(() => {
    if (!eventId) return;

    fetchEvento(eventId)
      .then((data) => {
        const [date, timeFull] = data.fechaHora.split("T");
        const time = timeFull.slice(0, 5);
        setMatch({
          id: data.id,
          selection: data.equipoLocal,
          rival: data.equipoVisitante,
          competition: "",
          stadium: data.estadio,
          city: data.ubicacion,
          date,
          time,
          price: 0,
        });
      })
      .catch(() => {
        if (typeof onNotify === "function") {
          onNotify("No se pudieron cargar los datos del evento.", "error");
        }
      });
  }, [eventId]);

  useEffect(() => {
    if (!match?.id) return;

    setLoadingSectors(true);
    fetchEventSectors(match.id)
      .then((data) => {
        setSectors(data);
        if (data.length > 0) {
          setSelectedSector(data[0]);
        }
        setLoadingSectors(false);
      })
      .catch(() => {
        setSectors([]);
        setLoadingSectors(false);
        if (typeof onNotify === "function") {
          onNotify("No se pudieron cargar los sectores disponibles.", "error");
        }
      });
  }, [match?.id]);

  if (!match) {
    return null;
  }

  const basePrice = match.price || 0;
  const subtotal = basePrice * quantity;
  const totalPrice = subtotal;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!buyerName.trim() || !buyerEmail.trim() || !documentNumber.trim()) {
      if (typeof onNotify === "function") {
        onNotify("Completá nombre, correo y documento para confirmar la compra.", "error");
      }

      return;
    }

    if (!selectedSector) {
      if (typeof onNotify === "function") {
        onNotify("Seleccioná un sector disponible.", "error");
      }

      return;
    }

    if (typeof onConfirmPurchase === "function") {
      onConfirmPurchase({
        matchId: match.id,
        selection: match.selection,
        rival: match.rival,
        competition: match.competition,
        stadium: match.stadium,
        city: match.city,
        date: match.date,
        time: match.time,
        basePrice,
        quantity,
        sectorId: selectedSector.idSector,
        sectorName: selectedSector.nombre,
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
      <div className="purchase-topbar">
        <button type="button" className="purchase-homeButton" onClick={onBackToHome}>
          Volver al inicio
        </button>
      </div>

      <section className="purchase-summary">
        <p className="purchase-kicker">Checkout oficial</p>
        <h1 className="purchase-title">{match.selection} vs {match.rival}</h1>
        <p className="purchase-description">
          Completá los datos para confirmar la compra de las entradas del partido seleccionado.
        </p>

        <div className="purchase-stepper" aria-label="Progreso de compra">
          <span className="is-active">1. Partido</span>
          <span className="is-active">2. Datos</span>
          <span>3. Confirmación</span>
        </div>

        <div className="purchase-matchbox">
          <p><strong>Competencia:</strong> {match.competition}</p>
          <p><strong>Estadio:</strong> {match.stadium}</p>
          <p><strong>Ciudad:</strong> {match.city}</p>
          <p><strong>Fecha:</strong> {match.date} · {match.time}</p>
          <p><strong>Precio base:</strong> ${basePrice}</p>
        </div>

        <button type="button" className="purchase-back" onClick={onBackToHome}>
          Cambiar partido
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
              <label>Sector</label>
              {loadingSectors ? (
                <select disabled>
                  <option>Cargando sectores...</option>
                </select>
              ) : sectors.length === 0 ? (
                <select disabled>
                  <option>No hay sectores disponibles</option>
                </select>
              ) : (
                <select
                  value={selectedSector?.idSector ?? ""}
                  onChange={(e) => {
                    const sector = sectors.find((s) => s.idSector === Number(e.target.value));
                    setSelectedSector(sector);
                  }}
                >
                  {sectors.map((sector) => (
                    <option key={sector.idSector} value={sector.idSector}>
                      Sector {sector.nombre} ({sector.asientosDisponibles} disponibles)
                    </option>
                  ))}
                </select>
              )}
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
              <span>Sector</span>
              <strong>{selectedSector ? `Sector ${selectedSector.nombre}` : "-"}</strong>
            </div>
            <div>
              <span>Total estimado</span>
              <strong>${totalPrice}</strong>
            </div>
          </div>

          <button type="submit" className="purchase-submit">
            Confirmar compra
          </button>

          <button type="button" className="purchase-secondaryAction" onClick={onBackToHome}>
            Volver al inicio sin comprar
          </button>
        </form>
      </section>
    </main>
  );
}
