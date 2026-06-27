import { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchEntradas,
  fetchEntradasCompradas,
  fetchUserByEmail,
  createTransferencia,
  fetchPendientesRecibidas,
  acceptTransferencia,
  rejectTransferencia,
} from "../api";

export default function useTicketTransfers(currentUser, onNotify) {
  const [ownedTickets, setOwnedTickets] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);

  const fetchUserTickets = useCallback(async (email) => {
    try {
      const [held, purchased] = await Promise.all([
        fetchEntradas(email),
        fetchEntradasCompradas(email),
      ]);
      const seen = new Set();
      const merged = [...purchased, ...held].filter((t) => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
      const mapped = merged.map((t) => {
        const [date, timeFull] = t.fechaHora.split("T");
        const time = timeFull?.slice(0, 5) || "";
        return {
          id: t.id,
          selection: t.equipoLocal,
          rival: t.equipoVisitante,
          competition: "",
          stadium: t.nombreEstadio,
          city: t.ubicacion,
          date,
          time,
          price: t.precio,
          totalPrice: t.montoTotal,
          sectorName: t.sectorNombre,
          purchasedByEmail: t.purchasedByEmail,
          purchasedByName: t.buyerNombre,
          currentHolderEmail: t.currentHolderEmail,
          currentHolder: t.holderNombre,
          documentType: t.holderDocTipo,
          documentNumber: t.holderDocNumero,
          ultimoDestinatario: t.ultimoDestinatario,
          estado: t.estado,
          pendingTransfer: null,
          transferHistory: [],
        };
      });
      setOwnedTickets(mapped);
    } catch {
      setOwnedTickets([]);
    }
  }, []);

  const fetchPendingTransfers = useCallback(async () => {
    try {
      const data = await fetchPendientesRecibidas();
      setPendingTransfers(data);
    } catch {
      setPendingTransfers([]);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.email) {
      Promise.all([
        fetchUserTickets(currentUser.email),
        fetchPendingTransfers(),
      ]);
    }
  }, [currentUser, fetchUserTickets, fetchPendingTransfers]);

  const handleTransferTicket = useCallback(async (ticketId, recipient) => {
    const normalizedRecipient = recipient.trim().toLowerCase();

    try {
      const recipientUser = await fetchUserByEmail(normalizedRecipient);

      if (recipientUser.email === currentUser?.email) {
        onNotify?.("No podés transferirte una entrada a tu propia cuenta.", "error");
        return;
      }

      const result = await createTransferencia(ticketId, normalizedRecipient);

      setOwnedTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                pendingTransfer: {
                  id: result.idTransferencia,
                  fromEmail: currentUser.email,
                  fromName: currentUser.nombre || currentUser.name,
                  toEmail: recipientUser.email,
                  toName: recipientUser.nombre,
                  requestedAt: new Date().toISOString(),
                },
              }
            : ticket,
        ),
      );
      onNotify?.("Transferencia enviada. El receptor debe aceptarla.", "success");
    } catch (err) {
      onNotify?.(err.message || "El usuario receptor no existe o no está registrado.", "error");
    }
  }, [currentUser, onNotify]);

  const handleAcceptTransfer = useCallback(async (transferId) => {
    try {
      await acceptTransferencia(transferId);
      onNotify?.("Transferencia aceptada. La entrada ahora está en tu poder.", "success");
      await Promise.all([
        fetchUserTickets(currentUser.email),
        fetchPendingTransfers(),
      ]);
    } catch (err) {
      onNotify?.(err.message, "error");
    }
  }, [currentUser, onNotify, fetchUserTickets, fetchPendingTransfers]);

  const handleRejectTransfer = useCallback(async (transferId) => {
    try {
      await rejectTransferencia(transferId);
      onNotify?.("Transferencia rechazada.", "success");
      await Promise.all([
        fetchUserTickets(currentUser.email),
        fetchPendingTransfers(),
      ]);
    } catch (err) {
      onNotify?.(err.message, "error");
    }
  }, [currentUser, onNotify, fetchUserTickets, fetchPendingTransfers]);

  const currentUserTickets = useMemo(() => {
    if (!currentUser) {
      return {
        purchasedTickets: [],
        heldTickets: [],
        pendingReceivedTransfers: [],
        transferHistory: [],
      };
    }

    const purchasedTickets = ownedTickets.filter(
      (ticket) => ticket.purchasedByEmail === currentUser.email,
    );
    const heldTickets = ownedTickets.filter(
      (ticket) => ticket.currentHolderEmail === currentUser.email,
    );

    const pendingReceivedTransfers = pendingTransfers.map((t) => {
      const [date, timeFull] = t.eventoFechaHora.split("T");
      const time = timeFull?.slice(0, 5) || "";
      return {
        id: t.idTransferencia,
        idEntrada: t.idEntrada,
        selection: t.equipoLocal,
        rival: t.equipoVisitante,
        competition: "",
        stadium: t.nombreEstadio,
        city: t.ubicacion,
        date,
        time,
        price: t.precio,
        totalPrice: t.montoTotal,
        sectorName: t.sectorNombre,
        purchasedByName: t.buyerNombre,
        currentHolderEmail: t.emailOrigen,
        currentHolder: t.holderNombre,
        ultimoDestinatario: null,
        pendingTransfer: {
          id: t.idTransferencia,
          fromEmail: t.emailOrigen,
          fromName: t.origenNombre,
          toEmail: t.emailRecibe,
        },
      };
    });

    const transferHistory = ownedTickets.flatMap((ticket) =>
      (ticket.transferHistory || [])
        .filter(
          (transfer) =>
            transfer.toEmail === currentUser.email ||
            transfer.fromEmail === currentUser.email,
        )
        .map((transfer) => ({
          ...transfer,
          ticketId: ticket.id,
          matchName: `${ticket.selection} vs ${ticket.rival}`,
          competition: ticket.competition,
          date: ticket.date,
          time: ticket.time,
        })),
    );

    return {
      purchasedTickets,
      heldTickets,
      pendingReceivedTransfers,
      transferHistory,
    };
  }, [currentUser, ownedTickets, pendingTransfers]);

  return {
    ...currentUserTickets,
    handleTransferTicket,
    handleAcceptTransfer,
    handleRejectTransfer,
  };
}
