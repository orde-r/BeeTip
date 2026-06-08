import "./CreateOrderForm.css";

interface CreateOrderFormProps {
  toLocation: string;
  itemDesc: string;
  isSubmitting: boolean;
  onToLocationChange: (value: string) => void;
  onItemDescChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function CreateOrderForm({
  toLocation,
  itemDesc,
  isSubmitting,
  onToLocationChange,
  onItemDescChange,
  onSubmit,
}: CreateOrderFormProps) {
  return (
    <form className="home-create-form" onSubmit={onSubmit}>
      <p className="create-order-title">Create Order</p>
      <label className="form-input-container">
        Delivery location
        <input
          type="text"
          value={toLocation}
          onChange={(e) => onToLocationChange(e.target.value)}
          placeholder="13th floor room 2"
          required
        />
      </label>
      <label className="form-input-container">
        Item request
        <textarea
          value={itemDesc}
          onChange={(e) => onItemDescChange(e.target.value)}
          placeholder="Chicken rice from canteen"
          required
        />
      </label>
      <button type="submit" className="primary-btn home-create-btn" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Place Order"}
      </button>
    </form>
  );
}
