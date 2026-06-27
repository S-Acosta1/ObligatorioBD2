import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchEvento, fetchEventSectors, createPurchase } from "../api";
import "./purchase.css";

export default function Purchase({ currentUser, onBackToHome, onNotify }) {
  const { eventId } = useParams();
  const [match, setMatch] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const quantityOptions = [1, 2, 3, 4, 5];

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

  const precioUnitario = selectedSector?.precio ?? 0;
  const subtotal = precioUnitario * quantity;
  const totalPrice = subtotal;

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedSector) {
      if (typeof onNotify === "function") {
        onNotify("Seleccioná un sector disponible.", "error");
      }
      return;
    }

    setSubmitting(true);

    try {
      await createPurchase({
        idEvento: match.id,
        idSector: selectedSector.idSector,
        cantidad: quantity,
        cardNumber: cardNumber || null,
        cardExpiry: cardExpiry || null,
        cardCvv: cardCvv || null,
        cardName: cardName || null,
        postalCode: postalCode || null,
      });

      if (typeof onNotify === "function") {
        onNotify("Compra realizada con éxito.", "success");
      }

      onBackToHome();
    } catch (err) {
      if (typeof onNotify === "function") {
        onNotify(err.message, "error");
      }
    } finally {
      setSubmitting(false);
    }
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
          <p><strong>Precio por entrada:</strong> ${precioUnitario}</p>
        </div>

        <div className="purchase-matchbox">
          <p><strong>Usuario:</strong> {currentUser?.nombre || currentUser?.email}</p>
          <p><strong>Email:</strong> {currentUser?.email}</p>
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
                      Sector {sector.nombre} ({sector.asientosDisponibles} disponibles) — ${sector.precio}
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
            <label>Tarjeta</label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>

          <div className="purchase-grid">
            <div className="purchase-field">
              <label>Vencimiento</label>
              <input
                type="text"
                placeholder="MM/AA"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
              />
            </div>
            <div className="purchase-field">
              <label>CVV</label>
              <input
                type="text"
                placeholder="123"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              />
            </div>
          </div>

          <div className="purchase-grid">
            <div className="purchase-field">
              <label>Nombre en la tarjeta</label>
              <input
                type="text"
                placeholder="Como figura en la tarjeta"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            <div className="purchase-field">
              <label>Código postal</label>
              <input
                type="text"
                placeholder="12345"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>

          <div className="purchase-summaryBox">
            <div>
              <span>Precio unitario</span>
              <strong>${precioUnitario}</strong>
            </div>
            <div>
              <span>Cantidad</span>
              <strong>{quantity}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>${totalPrice}</strong>
            </div>
          </div>

          <button type="submit" className="purchase-submit" disabled={submitting}>
            {submitting ? "Procesando..." : "Confirmar compra"}
          </button>

          <button type="button" className="purchase-secondaryAction" onClick={onBackToHome}>
            Volver al inicio sin comprar
          </button>
        </form>
      </section>
    </main>
  );
}
