# PharmaHub API & Server Actions Documentation

PharmaHub utilizes **Next.js Server Actions** for backend logic, providing a type-safe bridge between the React client and the server-side database operations.

## 🔐 Authentication
Authentication is managed by **NextAuth.js** with a credentials provider.
- **Session Strategy**: JWT
- **Roles**: `ADMIN`, `OWNER`, `STAFF`, `PATIENT` (New!)

## ⚡ Server Actions

### 📦 Bookings (`src/app/actions/bookings.ts`)
Handles the patient reservation workflow and pharmacy-side management.

#### `createBooking`
- **Purpose**: Creates a new reservation for a medicine.
- **Inputs**:
  - `inventoryId` (string): UUID of the inventory item.
  - `quantity` (number): Amount to reserve.
  - `tenantId` (string): ID of the pharmacy.
- **Returns**: `Booking` object.
- **Security**: Requires authenticated `PATIENT` or user.
- **Logic**: Validates stock > quantity, generates 6-char `pickupCode`.

#### `updateBookingStatus`
- **Purpose**: Updates the status of a booking (e.g., to READY or COMPLETED).
- **Inputs**:
  - `bookingId` (string)
  - `status` (`BookingStatus`: PENDING | READY | COMPLETED | CANCELLED)
- **Security**: Requires authenticated `OWNER` of the related tenant.

#### `getUserBookings`
- **Purpose**: Fetches all bookings for the logged-in patient.
- **Returns**: List of bookings with `inventory` and `medicine` details.

---

### 👤 Customers (`src/app/actions/customer.ts`)
Manages patient-specific operations.

#### `registerCustomer`
- **Purpose**: Registers a new patient account.
- **Inputs**: `FormData` (email, password, confirmPassword).
- **Logic**: Hashes password, assigns `PATIENT` role.

---

### 🔍 Search (`src/app/actions/search.ts`)
Public-facing medicine discovery engine.

#### `searchMedicines`
- **Purpose**: Finds medicines across all pharmacies.
- **Inputs**:
  - `query` (string): Name brand or generic.
  - `category` (string): Optional filter.
- **Logic**: 
  - Performs case-insensitive search.
  - Aggregates results by Unique Medicine ID.
  - Returns cheapest price and pharmacy locations.

---

### 📦 Inventory (`src/app/actions/inventory.ts`)
Strictly scoped to the logged-in pharmacy owner's tenant.

#### `addInventoryItem`
- **Purpose**: Adds a new medicine to the pharmacy's stock.
- **Inputs**: `FormData` (medicineName, genericName, price, quantity, lowStockThreshold, etc.)
- **Logic**: 
  - Checks if medicine exists globally; if not, creates it.
  - Upserts inventory record (links Tenant + Medicine).
  - Records an `INITIAL` or `RESTOCK` entry in `StockMovement`.

#### `updateInventoryItem`
- **Purpose**: Modifies existing inventory details.
- **Inputs**: `FormData` (id, price, quantity, etc.)
- **Logic**: 
  - Updates fields.
  - Calculates quantity delta and records `ADJUSTMENT` in `StockMovement` if changed.

#### `deleteInventoryItem`
- **Purpose**: Removes an item from inventory.
- **Inputs**: `id` (string).

---

### 🛡️ Admin (`src/app/actions/admin.ts`)
Platform administrator operations.

#### `approvePharmacy` / `rejectPharmacy`
- **Purpose**: Moderates new pharmacy registrations.
- **Inputs**: `tenantId`.
- **Security**: Requires `ADMIN` role.
- **Effect**: Updates `Tenant` status to `ACTIVE` or `REJECTED`.

---

### ⚙️ Settings (`src/app/actions/settings.ts`)
Pharmacy configuration.

#### `updateTenantSettings`
- **Purpose**: Updates pharmacy profile (Name, Address, Location, Hours).
- **Inputs**: `FormData`.
- **Logic**: JSON parses `openingHours` and updates `Tenant` record.

---

### 💰 Sales (`src/app/actions/sales.ts`)
Transactional sales logging.

#### `logSale`
- **Purpose**: Records a sale and deducts stock atomically.
- **Inputs**: `inventoryId`, `quantity`, `unitPrice`.
- **Logic**: 
  - **Transaction**:
    1. Verify stock > quantity.
    2. **Atomic Update**: `UPDATE "Inventory" SET quantity = quantity - X ...`
    3. Create `Sale` record.

---

### 📝 Registration (`src/app/actions/register.ts`)
Pharmacy onboarding flow.

#### `registerPharmacy`
- **Purpose**: Onboards a new pharmacy.
- **Inputs**: `FormData` (name, email, password, license, file).
- **Logic**:
  - Checks for existing user.
  - Uploads license file to Cloudinary (if present).
  - Creates `Tenant` (status: PENDING) and `User` (role: OWNER) transactionally.
