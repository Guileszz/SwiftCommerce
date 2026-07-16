# SwiftCommerce

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Website-brightgreen?style=for-the-badge)](https://swift-commerced.vercel.app/)
[![Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge)](https://github.com/babaswift2005/SwiftCommerce)

**SwiftCommerce** is a full-featured, modern e-commerce storefront and admin dashboard engineered for the next era of digital trade. Designed with rich micro-animations, glassmorphic layouts, and high-performance server-side rendering, it serves as a stunning showcase of a decentralized, intermediary-free e-commerce experience.

---

## Live Links
- **Demo Website**: [https://swift-commerced.vercel.app/](https://swift-commerced.vercel.app/)
- **Source Code**: [https://github.com/babaswift2005/SwiftCommerce](https://github.com/babaswift2005/SwiftCommerce)

---

## Features

### Client Storefront
* **Curated Catalog**: Beautifully rendered product grid layout with responsive filters.
* **Animated Checkout Flow**: Step-by-step interactive visualizer from shopping cart to order confirmation.
* **Crypto Payments Simulation**: On-chain payment settlement simulator with real-time feedback.
* **Theme Control**: Elegant dark/light mode toggle with smooth, synchronized CSS variable transitions.

### Admin Operations Dashboard
* **Real-time Overview**: Live metrics for sales conversion, orders, average order value, and website traffic.
* **Interactive Charting**: Custom SVG line graphs displaying annual revenue curves.
* **Inventory Control Panel**: Interactive warehouse management table displaying current stock status (In Stock, Low Stock, Sold Out).
* **Live Orders Monitor**: Feed of recent orders showing customers, amount, and payment methods.

---

## Technology Stack
* **Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (React 19 + Vite)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Database & Auth**: [Supabase](https://supabase.com/)
* **State Management**: [TanStack Query & Router](https://tanstack.com/)
* **Validation**: [Zod](https://zod.dev/)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## Getting Started

### 1. Prerequisites
Make sure you have Node.js and [Bun](https://bun.sh/) installed.

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/babaswift2005/SwiftCommerce.git
cd SwiftCommerce
bun install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
```

### 4. Running Locally
Start the development server:
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Extend and Make It Even Better

This repository serves as a robust base template. Here is how you can take it to the next level:
1. **Integrate Real Payments**: Replace the crypto mock payments button with [Stripe Checkout](https://stripe.com/) or [Coinbase Commerce SDK](https://commerce.coinbase.com/) for real transaction settlements.
2. **Database Migration**: Currently powered by Supabase (PostgreSQL). You can migrate to [MongoDB](https://www.mongodb.com/) using [Prisma ORM](https://www.prisma.io/) or [Mongoose](https://mongoosejs.com/) to match the target database configurations.
3. **Web3 Wallet Connection**: Integrate a library like [RainbowKit](https://www.rainbowkit.com/) or [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter) so customers can connect real wallets to settle payments directly on-chain.
4. **Custom CMS**: Hook the product list up to a headless CMS (like Sanity.io or Strapi) to allow administrators to add or update items dynamically.
