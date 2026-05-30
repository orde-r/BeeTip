# BeeTip
## App Overview
**BeeTip** is a proxy buying (jasa titip / jastip) mobile app for BINUS University campus. Students can request items from the first-floor shops/canteen, and a courier (Kurir) will buy and deliver them to their location (e.g., 13th floor room 2). The Kurir earns a fixed Rp 5.000 delivery fee per order.

Every user has a single account that can toggle between two roles: **Buyer** and **Kurir**. The toggle is always visible in the UI (e.g., a switch in the header or profile).

## Design Direction
- **Target audience**: University students (young, mobile-first).
- **Tone**: Clean, modern, friendly, and slightly playful — think a campus-friendly Grab/GoFood vibe with a bee/honey theme.
- **Primary color palette**: Honey yellow / amber tones with dark contrasts. Feel free to use a bee mascot or subtle honeycomb patterns as branding elements.
- **Platform**: Mobile-first (designed for phones). All screens should be portrait mobile layouts.

---

## Screens Needed

### 1. Authentication
#### 1a. Register Screen
- Fields: Email, Password, Confirm Password.
- A "Register" button.
- Link to "Already have an account? Login".

#### 1b. Login Screen
- Fields: Email, Password.
- A "Login" button.
- Link to "Don't have an account? Register".

---

### 2. Home / Order Feed (Buyer Mode)
This is what the user sees when they are in **Buyer** mode.
- Show the user's current balance prominently (e.g., "Rp 150.000").
- A prominent "Create New Order" button / FAB.
- A list of the user's own orders with status badges (PENDING, ACCEPTED, PRICED, PAID, COMPLETED, CANCELLED).
- Tapping an order opens the Order Detail screen.
- A role toggle switch visible at the top (currently set to "Buyer").

---

### 3. Home / Order Feed (Kurir Mode)
This is what the user sees when they toggle to **Kurir** mode.
- Show the user's current balance.
- A feed of **available orders** (status = PENDING) posted by other users. Each card shows: item description, delivery destination, and a fixed "Rp 5.000 fee".
- An "Accept" button on each order card.
- Below the available pool, show the Kurir's own active/accepted deliveries.
- A role toggle switch visible at the top (currently set to "Kurir").

---

### 4. Create Order Screen (Buyer)
- Fields:
  - **Delivery To** (text input, e.g., "13th floor room 2").
  - **Item Description** (textarea, e.g., "Chicken rice from canteen, extra sambal").
- A note showing "Delivery fee: Rp 5.000 (fixed)".
- A "Place Order" submit button.

---

### 5. Order Detail Screen
This screen adapts based on the order status and the user's role (Buyer vs Kurir). Design it as a single screen that evolves through states:

#### Status: PENDING (Buyer view)
- Show order info (item desc, destination).
- Status badge: "Waiting for Kurir".
- A "Cancel Order" button.

#### Status: ACCEPTED (Buyer & Kurir view)
- Show order info + assigned Kurir name.
- Status badge: "Kurir Accepted".
- A "Chat" button to open the in-app chat.
- **Kurir view adds**: An "Input Price" button/section.

#### Status: PRICED (Buyer view)
- Show the uploaded price (e.g., "Item Price: Rp 25.000").
- Show total: "Total: Rp 30.000 (Rp 25.000 + Rp 5.000 delivery)".
- A "Confirm & Pay" button.
- A "Chat" button.

#### Status: PAID (Buyer view)
- Show a large, prominent **Security Code** (e.g., "Your Code: 482915"). This should be visually distinct, like a card or badge.
- A note: "Give this code to your Kurir upon delivery."
- A "Chat" button.

#### Status: PAID (Kurir view)
- Show order info.
- Status: "Delivering — ask Buyer for code upon arrival".
- An "Enter Security Code" input field with a "Complete Delivery" button.
- A "Chat" button.

#### Status: COMPLETED
- Show "Order Completed ✓" with a green success state.
- Summary: item price, delivery fee, total.

#### Status: CANCELLED
- Show "Order Cancelled" with a muted/grey state.

---

### 6. Chat Screen
- A standard messaging interface between the Buyer and the Kurir for a specific order.
- Show the order context at the top (item description, status).
- Chat bubbles: sender's messages on the right, other party on the left.
- A text input bar at the bottom with a send button.
- Real-time messaging (Socket.io powered, but just design the UI).

---

### 7. Wallet / Balance Screen
- Show current balance prominently (e.g., "Rp 150.000").
- A "Top Up" button that opens a simple form to input an amount (this is a mock — no real payment gateway).
- A transaction history list showing entries like:
  - "+ Rp 100.000 — Deposit" (green)
  - "- Rp 30.000 — Payment for Order #abc" (red)
  - "+ Rp 30.000 — Earning from Order #xyz" (green)

---

### 8. Profile Screen (Optional)
- Show user email.
- Show current role toggle (Buyer / Kurir).
- Show balance.
- Logout button.

---

## Order Status Flow (for reference)
```
PENDING → ACCEPTED → PRICED → PAID → COMPLETED
   ↓          ↓          ↓
CANCELLED  CANCELLED  CANCELLED
```

## Key UX Notes
- The **role toggle** (Buyer ↔ Kurir) should be accessible from the main screen without navigating to settings. It's a core interaction.
- The **security code** on the PAID screen (Buyer view) should be the most prominent element — it's the key handoff mechanism.
- The **balance** should always be visible on the main screen since it directly affects whether a Buyer can pay.
- Use status-colored badges consistently: e.g., yellow for PENDING, blue for ACCEPTED, orange for PRICED, green for PAID/COMPLETED, grey for CANCELLED.
- The delivery fee is always fixed at **Rp 5.000** — show this clearly so users know upfront.