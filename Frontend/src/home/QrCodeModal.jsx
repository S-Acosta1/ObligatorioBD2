import { useState, useEffect, useRef, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { fetchQrCode } from "../api";

export default function QrCodeModal({ ticketId, onClose }) {
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const loadQr = useCallback(async () => {
    try {
      const data = await fetchQrCode(ticketId);
      setQrCode(data.codigo);
      setError(null);
    } catch {
      setError("Error al obtener el código QR.");
    }
  }, [ticketId]);

  useEffect(() => {
    loadQr();
    intervalRef.current = setInterval(loadQr, 30000);
    return () => clearInterval(intervalRef.current);
  }, [loadQr]);

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="qr-modal-close" onClick={onClose}>
          Cerrar
        </button>

        <h2 className="qr-modal-title">Código QR</h2>
        <p className="qr-modal-subtitle">Mostrá este código en el acceso al estadio</p>

        <div className="qr-code-container">
          {error ? (
            <p className="qr-error">{error}</p>
          ) : qrCode ? (
            <QRCodeCanvas value={qrCode} size={256} level="M" />
          ) : (
            <div className="qr-spinner" />
          )}
        </div>

        <p className="qr-refresh-note">Se actualiza cada 30 segundos</p>
      </div>
    </div>
  );
}
