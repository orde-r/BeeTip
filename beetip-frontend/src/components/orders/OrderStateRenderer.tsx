import {
  GhostActionButton,
  PrimaryActionButton,
} from "../actions/ActionButton";
import { routes } from "../../app/routes";
import { Notice } from "../layout/Notice";
import { ChatPreview } from "./ChatPreview";
import { OrderActionBar } from "./OrderActionBar";
import { OrderOutcomePanel } from "./OrderOutcomePanel";
import { PriceBreakdown } from "./PriceBreakdown";
import { PriceInputPanel } from "./PriceInputPanel";
import { SecurityCodePanel } from "./SecurityCodePanel";
import type { OrderDTO } from "../../types/api";
import { formatRupiah } from "../../utils/format";
import { getOrderTotal } from "../../utils/orderState";
import type { OrderActor } from "../../utils/orderState";

type OrderStateRendererProps = {
  order: OrderDTO;
  actor: OrderActor;
  securityCode: string | null;
  isMutating: boolean;
  actionError: string;
  onCancel: () => void;
  onRelease: () => void;
  onPrice: (payload: {
    item_price: number;
    receipt_image_url?: string;
  }) => Promise<void>;
};

export function OrderStateRenderer({
  order,
  actor,
  securityCode,
  isMutating,
  actionError,
  onCancel,
  onRelease,
  onPrice,
}: OrderStateRendererProps) {
  const chatTo = `/orders/${order.id}/chat`;

  if (actor === "VIEWER") {
    return (
      <>
        <Notice tone="error">
          This order is only available to its buyer and assigned kurir.
        </Notice>
        <PriceBreakdown order={order} />
      </>
    );
  }

  const homeTo = actor === "KURIR" ? routes.kurirHome : routes.buyerHome;
  const homeLabel = "Back to Previous Page";

  return (
    <>
      {actionError ? <Notice tone="error">{actionError}</Notice> : null}
      {actor === "BUYER" ? (
        <BuyerOrderState
          order={order}
          chatTo={chatTo}
          homeTo={homeTo}
          homeLabel={homeLabel}
          securityCode={securityCode}
          isMutating={isMutating}
          onCancel={onCancel}
        />
      ) : (
        <KurirOrderState
          order={order}
          chatTo={chatTo}
          homeTo={homeTo}
          homeLabel={homeLabel}
          isMutating={isMutating}
          onRelease={onRelease}
          onPrice={onPrice}
        />
      )}
    </>
  );
}

function BuyerOrderState({
  order,
  chatTo,
  homeTo,
  homeLabel,
  securityCode,
  isMutating,
  onCancel,
}: {
  order: OrderDTO;
  chatTo: string;
  homeTo: string;
  homeLabel: string;
  securityCode: string | null;
  isMutating: boolean;
  onCancel: () => void;
}) {
  switch (order.status) {
    case "PENDING":
      return (
        <>
          <Notice>Your request is waiting for a kurir to accept it.</Notice>
          <PriceBreakdown order={order} />
          <OrderActionBar>
            <GhostActionButton onClick={onCancel} disabled={isMutating}>
              {isMutating ? "Cancelling..." : "Cancel order"}
            </GhostActionButton>
            <GhostActionButton to={homeTo}>{homeLabel}</GhostActionButton>
          </OrderActionBar>
        </>
      );
    case "ACCEPTED":
      return (
        <>
          <Notice>
            A kurir accepted your request and will upload the item price.
          </Notice>
          <PriceBreakdown order={order} />
          <ChatPreview to={chatTo} />
          <OrderActionBar>
            <GhostActionButton onClick={onCancel} disabled={isMutating}>
              {isMutating ? "Cancelling..." : "Cancel order"}
            </GhostActionButton>
            <GhostActionButton to={homeTo}>{homeLabel}</GhostActionButton>
          </OrderActionBar>
        </>
      );
    case "PRICED":
      return (
        <>
          <Notice tone="success">
            The item price is ready. Pay to receive the handoff code.
          </Notice>
          <PriceBreakdown order={order} />
          <ChatPreview to={chatTo} />
          <OrderActionBar>
            <PrimaryActionButton to={`/orders/${order.id}/payment`}>
              Pay now
            </PrimaryActionButton>
            <GhostActionButton onClick={onCancel} disabled={isMutating}>
              Cancel order
            </GhostActionButton>
            <GhostActionButton to={homeTo}>{homeLabel}</GhostActionButton>
          </OrderActionBar>
        </>
      );
    case "PAID":
      return (
        <>
          <Notice tone="success">
            Payment is complete. Keep the handoff code private until delivery.
          </Notice>
          <PriceBreakdown order={order} />
          <SecurityCodePanel code={securityCode} />
          <ChatPreview to={chatTo} />
          <HomeActionBar homeTo={homeTo} homeLabel={homeLabel} />
        </>
      );
    case "COMPLETED":
      return (
        <>
          <OrderOutcomePanel
            tone="success"
            title="Order completed"
            description="The handoff is confirmed and the kurir earning has been recorded."
            metaLabel="Final total"
            metaValue={getFinalTotalLabel(order)}
          />
          <PriceBreakdown order={order} />
          <HomeActionBar homeTo={homeTo} homeLabel={homeLabel} />
        </>
      );
    case "CANCELLED":
      return (
        <>
          <OrderOutcomePanel
            tone="muted"
            title="Order cancelled"
            description="No further action is available for this request."
            // metaLabel="Last known total"
            // metaValue={getFinalTotalLabel(order)}
          />
          <PriceBreakdown order={order} />
          <HomeActionBar homeTo={homeTo} homeLabel={homeLabel} />
        </>
      );
  }
}

function KurirOrderState({
  order,
  chatTo,
  homeTo,
  homeLabel,
  isMutating,
  onRelease,
  onPrice,
}: {
  order: OrderDTO;
  chatTo: string;
  homeTo: string;
  homeLabel: string;
  isMutating: boolean;
  onRelease: () => void;
  onPrice: (payload: {
    item_price: number;
    receipt_image_url?: string;
  }) => Promise<void>;
}) {
  switch (order.status) {
    case "PENDING":
      return (
        <>
          <Notice>This request is back in the available order pool.</Notice>
          <PriceBreakdown order={order} />
          <HomeActionBar homeTo={homeTo} homeLabel={homeLabel} />
        </>
      );
    case "ACCEPTED":
      return (
        <>
          <Notice>Add the final item price so the buyer can pay.</Notice>
          <PriceInputPanel disabled={isMutating} onSubmit={onPrice} />
          <ChatPreview to={chatTo} />
          <OrderActionBar>
            <GhostActionButton onClick={onRelease} disabled={isMutating}>
              {isMutating ? "Releasing..." : "Release order"}
            </GhostActionButton>
            <GhostActionButton to={homeTo}>{homeLabel}</GhostActionButton>
          </OrderActionBar>
        </>
      );
    case "PRICED":
      return (
        <>
          <Notice>Waiting for the buyer to pay.</Notice>
          <PriceBreakdown order={order} />
          <ChatPreview to={chatTo} />
          <OrderActionBar>
            <GhostActionButton onClick={onRelease} disabled={isMutating}>
              {isMutating ? "Releasing..." : "Release order"}
            </GhostActionButton>
            <GhostActionButton to={homeTo}>{homeLabel}</GhostActionButton>
          </OrderActionBar>
        </>
      );
    case "PAID":
      return (
        <>
          <Notice tone="success">
            The buyer has paid. Complete delivery with their security code.
          </Notice>
          <PriceBreakdown order={order} />
          <ChatPreview to={chatTo} />
          <OrderActionBar>
            <PrimaryActionButton to={`/kurir/orders/${order.id}/security`}>
              Enter security code
            </PrimaryActionButton>
            <GhostActionButton to={homeTo}>{homeLabel}</GhostActionButton>
          </OrderActionBar>
        </>
      );
    case "COMPLETED":
      return (
        <>
          <OrderOutcomePanel
            tone="success"
            title="Delivery completed"
            description="The buyer confirmed the handoff and the earning is reflected in your wallet."
            metaLabel="Earning basis"
            metaValue={getFinalTotalLabel(order)}
          />
          <PriceBreakdown order={order} />
          <HomeActionBar homeTo={homeTo} homeLabel={homeLabel} />
        </>
      );
    case "CANCELLED":
      return (
        <>
          <OrderOutcomePanel
            tone="muted"
            title="Delivery cancelled"
            description="This request has been closed and is no longer available for action."
            metaLabel="Last known total"
            metaValue={getFinalTotalLabel(order)}
          />
          <PriceBreakdown order={order} />
          <HomeActionBar homeTo={homeTo} homeLabel={homeLabel} />
        </>
      );
  }
}

function HomeActionBar({
  homeTo,
  homeLabel,
}: {
  homeTo: string;
  homeLabel: string;
}) {
  return (
    <OrderActionBar>
      <GhostActionButton to={homeTo}>{homeLabel}</GhostActionButton>
    </OrderActionBar>
  );
}

function getFinalTotalLabel(order: OrderDTO) {
  return order.item_price === null
    ? "Pending"
    : formatRupiah(getOrderTotal(order));
}
