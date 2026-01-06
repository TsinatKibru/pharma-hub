# PharmaHub 💊

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-black?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

PharmaHub is a comprehensive, multi-tenant SaaS application designed to empower pharmacies with efficient inventory management while providing the public with a transparent portal for medicine discovery and price comparison.

## 🌟 Why PharmaHub?

Traditional pharmacy management often lacks transparency for patients and scalability for owners. PharmaHub bridges this gap:

- **For Pharmacies**: A robust dashboard to manage stock levels atomically, track daily sales, and reach more customers through a verified public profile.
- **For the Public**: A real-time search engine to find medicines nearby, compare prices across multiple pharmacies, and check availability without leaving home.
- **For the Platform**: Secure multi-tenancy enforced at the database layer ensures that every pharmacy's data remains private and isolated.

## 🚀 Key Features

### 🏢 Pharmacy Operations
- **Self-Service Onboarding**: Easy registration workflow for new pharmacies.
- **Admin Approval**: Manual verification of licenses by platform admins before activation.
- **Atomic Inventory**: Prevents race conditions during high-volume sales.
- **Stock Audit Trails**: Comprehensive `StockMovement` history for every inventory change.
- **Business Hours Editor**: Interactive schedule management with "Open Now" status logic.
- **Sales Analytics**: Real-time sales logging with strict tenant-scoping security.

### 🔍 Public Discovery
- **Global Search**: Search by brand name or generic active ingredients with category filters.
- **Price comparison**: Highlighting "Lowest Price" badge and sorting by distance/price.
- **Interactive Maps**: Map view with interactive popups showing price, status, and Google Maps directions.
- **Premium UX**: Skeleton loading states for search and map interactions.

### 🛡️ Technical Excellence
- **Database Multi-tenancy**: Shared-schema isolation using Prisma Client Extensions and tenant-scoped `count` operations.
- **React 19 & Next.js 16**: Utilizing the latest React features and Next.js App Router.
- **Atomic Concurrency**: Raw SQL updates for stock consistency under heavy load.
- **Role-Based Access**: Granular control for ADMIN, OWNER, and STAFF roles.

## 🛠️ Getting Started

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (for PostgreSQL)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/pharma-hub.git
   cd pharma-hub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5436/pharmahub?schema=public"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Start the Database**:
   ```bash
   docker-compose up -d
   ```

5. **Initialize Prisma**:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

6. **Run the Development Server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📖 Usage Examples

### Logging a Sale (Pharmacy Dashboard)
When a sale is recorded, the system atomically deducts stock:
```typescript
// Example of the atomic update logic in src/lib/inventory-utils.ts
await tx.$executeRaw`
  UPDATE "Inventory" 
  SET "quantity" = "quantity" - ${quantity} 
  WHERE "id" = ${id} AND "quantity" >= ${quantity}
`;
```

### Searching Medicines (Public Portal)
Patients can find the best price for "Paracetamol":
- Navigate to `/search`
- Enter "Paracetamol"
- View a ranked list of pharmacies by price and availability.

## 🤝 Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🆘 Support

If you're having trouble, please check our [Documentation](docs/) or open an [Issue](https://github.com/your-username/pharma-hub/issues).

## 👤 Maintainers

- **Main Maintainer**: Senior Engineering Team @ PharmaHub
- **Contributors**: See the full list in [Contributors](https://github.com/your-username/pharma-hub/contributors).

---
Built with ❤️ for better healthcare accessibility.
