import type { Order } from "../../types/order";
import "./OrderParticipantMeta.css";

type ParticipantMode = "counterparty" | "orderedBy";

interface OrderParticipantMetaProps {
  order: Order;
  viewerId?: string;
  mode?: ParticipantMode;
  className?: string;
}

interface ParticipantMeta {
  label: "Ordered by" | "Taken by";
  value: string;
}

const getOrderedByMeta = (order: Order): ParticipantMeta => ({
  label: "Ordered by",
  value: order.buyer_email ?? "Unknown buyer",
});

const getCounterpartyMeta = (
  order: Order,
  viewerId?: string,
): ParticipantMeta | null => {
  if (!viewerId) return null;

  if (order.buyer_id === viewerId) {
    return {
      label: "Taken by",
      value: order.kurir_email ?? "No kurir yet",
    };
  }

  if (order.kurir_id === viewerId) {
    return getOrderedByMeta(order);
  }

  return null;
};

export default function OrderParticipantMeta({
  order,
  viewerId,
  mode = "counterparty",
  className = "",
}: OrderParticipantMetaProps) {
  const meta =
    mode === "orderedBy" ? getOrderedByMeta(order) : getCounterpartyMeta(order, viewerId);

  if (!meta) return null;

  return (
    <p className={`order-participant-meta ${className}`.trim()}>
      <span className="order-participant-meta-label">{meta.label}</span>
      <span className="order-participant-meta-value">{meta.value}</span>
    </p>
  );
}
