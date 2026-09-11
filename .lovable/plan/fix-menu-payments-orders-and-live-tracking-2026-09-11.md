# Fix menu, payments, orders, and live tracking

## Goal
Make menu changes visible to customers, prevent abandoned online payments from looking like placed orders, stabilize the admin order workflow, and add customer delivery tracking.

## Changes

### 1. Menu editor and deletion
- Wire the existing photo drag-and-drop uploader into the menu edit form.
- Improve save/delete validation, loading feedback, error handling, and confirmation states.
- Move the customer menu page from bundled sample data to the live database so edits and deletions appear immediately.
- Keep deleted dishes out of new carts; retain order-line snapshots for old orders.

### 2. Online payment lifecycle
- Add a protected server action that marks an unpaid Razorpay order as cancelled when the payment window is dismissed or verification fails.
- Record cancellation/payment events in order history.
- Keep successful payment confirmation idempotent and never mark an unpaid online attempt as a normal active order.
- Show payment status separately from kitchen/delivery status in admin.

### 3. Admin orders
- Add safer status changes with loading/error states and validated transitions.
- Display paid, pending, and cancelled payment states clearly.
- Keep order items, assignments, and activity history updating in real time.
- Ensure cancelled orders cannot continue through preparation or delivery.

### 4. Customer order history and tracking
- Replace the old browser-only order history with account-specific live database orders.
- Add a Track order page showing the current status timeline, order details, assigned partner state, last location update, and a map/location link when coordinates exist.
- Subscribe to order, history, and delivery-location updates so the page refreshes automatically.
- Add tracking links from checkout confirmation and My Orders.

### 5. Delivery location source
- Add a delivery-partner page for assigned orders that can start/stop phone location sharing and update pickup/delivered status.
- Reuse existing role checks and row-level access so only the assigned partner can publish a location and only the customer/admin/partner can read it.

## Technical details
- Use authenticated server functions for payment cancellation and sensitive order mutations.
- Apply any required database functions/policies through a migration with explicit grants.
- Preserve existing design tokens and navigation patterns.
- Verify type safety plus customer/admin/partner flows in the running preview.
