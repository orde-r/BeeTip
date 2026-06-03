# BeeTip Enhancement Plan

Last updated: 2026-06-01

This plan converts the enhancement notes into an implementation sequence. It assumes the current frontend already has separate Buyer Home, Kurir Home, Wallet, Chat, Profile, Order Detail, Payment, and Chat Thread screens.

## Product Direction

- Merge Buyer Home and Kurir Home into one default Home screen.
- Use a top-right Home toggle to switch between Buyer mode and Kurir mode.
- Keep Home focused on active work only.
- Move order history out of Buyer/Kurir Home into a dedicated Order History experience.
- Keep chat available for active orders, and keep completed-order chat readable but not writable.
- Improve empty states, active-order display, payment confirmation, receipt handling, and dashboard totals.

## Phase 1: Navigation And Home Merge

Status: Done on 2026-06-01.

Goal: replace separate Buyer/Kurir home destinations with one Home screen.

Tasks:

- Create a unified `HomePage` container. Done.
- Reuse or extract the existing Buyer and Kurir dashboard sections instead of duplicating data logic. Done.
- Add a top-right segmented toggle in `AppTopBar`. Done:
  - Buyer mode shows Buyer dashboard content.
  - Kurir mode shows Kurir dashboard content.
- Make Home the default authenticated page. Done.
- Update bottom navigation to use one Home item instead of separate Buyer and Kurir items. Done.
- Keep existing child routes for create order, available orders, order detail, security code, and chat. Done.
- Keep `/kurir` as a backwards-compatible alias that opens Home in Kurir mode. Done.

Acceptance criteria:

- After login, the user lands on the unified Home screen.
- The top-right toggle switches Buyer/Kurir dashboard content without leaving the page.
- Bottom nav no longer shows separate Buyer and Kurir tabs.
- Deep links to existing child screens still work.

## Phase 2: Home Dashboard Improvements

Status: Done on 2026-06-01.

Goal: make Home show the right active work and remove history clutter.

Tasks:

- Buyer mode:
  - Show wallet balance on the Buyer dashboard. Done.
  - Show active Buyer orders as a stack/list when there is more than one active order. Done.
  - Show improved empty state when there are no active Buyer orders. Done.
  - Keep Create New Order as the main Buyer action. Done.
  - Remove Buyer order history from Home. Done.
- Kurir mode:
  - Show active Kurir deliveries as a stack/list when there is more than one active delivery. Done.
  - Show improved empty state when there are no active Kurir deliveries. Done.
  - Keep Accept New Order as the main Kurir action. Done.
  - Remove Kurir order history from Home. Done.
  - Calculate dashboard earning as `Rp 5.000 * completed deliveries`. Done.

Acceptance criteria:

- Multiple active Buyer/Kurir orders are visible instead of only the first active order.
- Home empty states are clear and useful.
- Home contains active work and dashboard summary only, not historical order lists.
- Kurir earning total matches completed delivery count multiplied by `5000`.

## Phase 3: Floating Bottom Actions

Status: Done on 2026-06-01.

Goal: make the primary Buyer/Kurir actions easier to reach.

Tasks:

- Move Buyer `Create new order` into a fixed floating bottom button. Done.
- Move Kurir `Accept new order` into a fixed floating bottom button. Done.
- Position the floating action above the bottom navigation. Done.
- Ensure it does not overlap content, cards, or the bottom nav on small mobile screens. Done statically; visual QA still recommended.
- Add enough bottom padding to scrollable content so the last card remains reachable. Done.

Acceptance criteria:

- Buyer and Kurir primary actions remain visible near the bottom of Home.
- The floating action is thumb-friendly and does not cover active order cards.
- Mobile viewport QA passes at around `390px` width.

## Phase 4: Payment Confirmation Modal

Status: Done on 2026-06-01.

Goal: remove the separate payment page from the normal Buyer flow.

Tasks:

- In Buyer `PRICED` state, open a payment confirmation popup/modal from Order Detail. Done.
- The modal should show:
  - item price. Done;
  - delivery fee. Done;
  - total payment. Done;
  - current wallet balance. Done;
  - insufficient-balance message and top-up action when needed. Done.
- Confirming the modal calls `POST /orders/{id}/pay`. Done.
- Save and show the returned `security_code` after successful payment. Done.
- Keep or redirect the old `/orders/:id/payment` route only if needed for compatibility. Kept as a fallback route.

Acceptance criteria:

- Buyer can pay directly from Order Detail without navigating to Payment Page.
- Payment still stores the security code and refreshes wallet balance.
- Failed payment errors appear inside the modal or directly below the payment action.

## Phase 5: Receipt Base64 Handling

Status: Done on 2026-06-01.

Goal: support receipt images from Base64 data instead of only plain URLs.

Tasks:

- Add Kurir receipt image upload on the price submission flow. Done.
- Convert the selected image to a Base64 data URL. Done.
- Submit the Base64 data URL through the existing `receipt_image_url` field, unless the backend contract changes. Done.
- Show receipt preview before Kurir submits the price. Done.
- Show Buyer receipt preview on Order Detail when `receipt_image_url` is a Base64 data URL. Done.
- Keep support for normal URL values if existing data already uses URLs. Done.
- Add validation for empty, invalid, or too-large images if required. Done with image-only and 2 MB maximum validation.

Acceptance criteria:

- Kurir can attach a receipt image while submitting item price.
- Buyer can view the receipt image from the order detail.
- Both Base64 data URLs and existing image URLs render correctly.

## Phase 6: Order History And Chat Restructure

Status: Done on 2026-06-01.

Goal: separate active orders from historical orders and make completed chats read-only.

Tasks:

- Replace the current Chat inbox concept with an Order History screen, or add Order History as a separate main screen. Done; `/order-history` is the main Order History route and `/chats` redirects for compatibility.
- Add Buyer/Kurir filter tabs on Order History. Done.
- Add Active/History separation:
  - active statuses: `PENDING`, `ACCEPTED`, `PRICED`, `PAID`. Done;
  - history statuses: `COMPLETED`, `CANCELLED`. Done.
- Move historical Buyer and Kurir order lists from Home into this screen. Done.
- Each history item should open Order Detail. Done.
- Orders with chat context should still allow opening chat history. Done.
- Completed or cancelled orders must not allow sending new chat messages. Done.
- Chat thread should remain readable for completed orders. Done.
- Remove duplicated order-status display from Chat Page. Done.

Acceptance criteria:

- Home does not show order history.
- Order History can filter between Buyer and Kurir orders.
- Completed orders expose chat history but the message composer is disabled/hidden.
- Chat Page shows order status only once.

## Phase 7: Visual QA And Regression Checks

Status: Done on 2026-06-01 with static checks and mock-backed mobile screenshots.

Goal: verify the enhancement does not break core Buyer/Kurir flows.

Tasks:

- Run lint and build. Done.
- Check Home in Buyer and Kurir modes. Done with 390 CSS-pixel screenshots.
- Check empty, loading, error, single-active-order, and multi-active-order states. Done statically and with representative mock data for active states.
- Check floating action layout at mobile width. Done with 390 CSS-pixel screenshots.
- Check Order Detail payment modal. Done with a 390 CSS-pixel screenshot.
- Check receipt upload and receipt preview. Done statically and with Order Detail receipt preview screenshot.
- Check Order History filters. Done with a 390 CSS-pixel screenshot.
- Check active chat and completed read-only chat. Done with completed read-only chat screenshot.

Verification commands:

```bash
npm run lint
npm run build
```

## Open Questions

Implementation decisions made to keep the work moving:

1. Bottom nav remains four items: `Home`, `History`, `Wallet`, `Profile`.
2. Home Buyer/Kurir toggle defaults to Buyer for `/home`; `/kurir` opens Kurir mode.
3. `/orders/:id/payment` is kept as a fallback page.
4. Floating bottom buttons appear only on Home.
5. Base64 receipt data URLs are submitted through `receipt_image_url`; frontend enforces image-only and 2 MB maximum.
6. Order History uses two tabs (`Buyer`, `Kurir`) with Active and History sections inside each tab.
7. Kurir earnings are calculated as `5000 * completed orders`.
