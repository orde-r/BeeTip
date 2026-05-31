import { useState } from "react";
import type { Order } from "../../types/order";
import { formatCurrency } from "../../utils/formatters";
import ReceiptCameraCapture from "../ReceiptCameraCapture/ReceiptCameraCapture";
import "./OrderStateAction.css";

interface OrderStateActionProps {
  order: Order;
  currentUserId?: string;
  securityCode?: string;
  price: string;
  receiptImageUrl: string;
  completionCode: string;
  isActionLoading: boolean;
  onPriceChange: (value: string) => void;
  onReceiptImageSelect: (file: File) => void;
  onReceiptImageCapture: (imageDataUrl: string) => void;
  onCompletionCodeChange: (value: string) => void;
  onUploadPrice: (e: React.FormEvent<HTMLFormElement>) => void;
  onPay: () => void;
  onComplete: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export default function OrderStateAction({
  order,
  currentUserId,
  securityCode,
  price,
  receiptImageUrl,
  completionCode,
  isActionLoading,
  onPriceChange,
  onReceiptImageSelect,
  onReceiptImageCapture,
  onCompletionCodeChange,
  onUploadPrice,
  onPay,
  onComplete,
  onCancel,
}: OrderStateActionProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const isBuyer = order.buyerId === currentUserId;
  const isKurir = order.kurirId === currentUserId;
  const total = (order.itemPrice ?? 0) + order.deliveryFee;
  const receiptPreview = receiptImageUrl || order.receiptImageUrl;

  const renderPriceForm = (title: string, submitLabel: string) => (
    <form className="chat-action-panel" onSubmit={onUploadPrice}>
      <p className="chat-action-title">{title}</p>
      <label className="form-input-container">
        Item price
        <input
          type="number"
          min="1"
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
          placeholder={order.itemPrice ? String(order.itemPrice) : "25000"}
          required
        />
      </label>
      <div className="receipt-picker">
        <p className="receipt-picker-label">Receipt image</p>
        <div className="receipt-picker-actions">
          <label className="outline-btn receipt-picker-btn">
            <span className="material-symbols-outlined">photo_library</span>
            Gallery
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onReceiptImageSelect(file);
              }}
            />
          </label>
          <button
            type="button"
            className="outline-btn receipt-picker-btn"
            onClick={() => setIsCameraOpen(true)}
          >
            <span className="material-symbols-outlined">photo_camera</span>
            Camera
          </button>
        </div>
        {isCameraOpen && (
          <ReceiptCameraCapture
            onCapture={onReceiptImageCapture}
            onClose={() => setIsCameraOpen(false)}
          />
        )}
        {receiptPreview && (
          <img className="receipt-preview" src={receiptPreview} alt="Receipt preview" />
        )}
      </div>
      <button type="submit" className="primary-btn chat-action-btn" disabled={isActionLoading}>
        {isActionLoading ? "Saving..." : submitLabel}
      </button>
      <button type="button" className="outline-btn chat-action-btn chat-danger-btn" onClick={onCancel} disabled={isActionLoading}>
        Cancel Order
      </button>
    </form>
  );

  switch (order.status) {
    case "PENDING":
      return (
        <div className="chat-action-panel">
          <p className="chat-action-title">Waiting for a kurir</p>
          <p className="chat-action-copy">This order is visible in the public order pool.</p>
          {isBuyer && (
            <button type="button" className="outline-btn chat-action-btn chat-danger-btn" onClick={onCancel} disabled={isActionLoading}>
              {isActionLoading ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      );
    case "ACCEPTED":
      if (!isKurir) {
        return (
          <div className="chat-action-panel">
            <p className="chat-action-title">Kurir accepted</p>
            <p className="chat-action-copy">Chat with your kurir while they confirm the final price.</p>
          </div>
        );
      }

      return renderPriceForm("Upload item price", "Submit Price");
    case "PRICED":
      if (!isBuyer) {
        return (
          <div className="chat-action-panel">
            <p className="chat-action-title">Waiting for payment</p>
            <p className="chat-action-copy">Buyer needs to pay {formatCurrency(total)} before delivery.</p>
            <button type="button" className="outline-btn chat-action-btn chat-danger-btn" onClick={onCancel} disabled={isActionLoading}>
              Cancel Order
            </button>
          </div>
        );
      }

      return (
        <div className="chat-action-panel">
          <p className="chat-action-title">Confirm payment</p>
          <p className="chat-action-copy">
            Total due is {formatCurrency(total)} including delivery fee.
          </p>
          <button type="button" className="primary-btn chat-action-btn" onClick={onPay} disabled={isActionLoading}>
            {isActionLoading ? "Paying..." : "Pay Order"}
          </button>
          <button type="button" className="outline-btn chat-action-btn chat-danger-btn" onClick={onCancel} disabled={isActionLoading}>
            Cancel Order
          </button>
        </div>
      );
    case "PAID":
      if (isBuyer) {
        return (
          <div className="chat-action-panel chat-code-panel">
            <p className="chat-action-title">Security Code</p>
            <p className="chat-security-code">{securityCode ?? "Saved code unavailable"}</p>
            <p className="chat-action-copy">Show this code to the kurir only after receiving the order.</p>
          </div>
        );
      }

      if (!isKurir) return null;

      return (
        <form className="chat-action-panel" onSubmit={onComplete}>
          <p className="chat-action-title">Complete delivery</p>
          <label className="form-input-container">
            Buyer security code
            <input
              type="text"
              value={completionCode}
              onChange={(e) => onCompletionCodeChange(e.target.value)}
              placeholder="123456"
              required
            />
          </label>
          <button type="submit" className="primary-btn chat-action-btn" disabled={isActionLoading}>
            {isActionLoading ? "Completing..." : "Complete Order"}
          </button>
        </form>
      );
    case "COMPLETED":
      return (
        <div className="chat-action-panel">
          <p className="chat-action-title">Order completed</p>
          <p className="chat-action-copy">Payment has been released to the kurir.</p>
        </div>
      );
    case "CANCELLED":
      return (
        <div className="chat-action-panel">
          <p className="chat-action-title">Order cancelled</p>
          <p className="chat-action-copy">This order is no longer active.</p>
        </div>
      );
  }
}
