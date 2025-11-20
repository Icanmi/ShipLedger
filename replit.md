# ShipLedger - Blockchain Maritime Platform

## Overview

ShipLedger is a blockchain-powered digital shipping and trade finance platform built on the BlockDAG network. The system digitizes Bills of Lading (eBLs), automates trade finance workflows through smart contracts, and provides immutable cargo tracking across the global maritime supply chain. The platform eliminates paper-based inefficiencies in shipping documentation by creating a transparent, multi-stakeholder ecosystem where shippers, carriers, customs authorities, port operators, and financial institutions can collaborate on verified blockchain records.

## Recent Changes (November 20, 2025)

### Role-Specific Dashboard Implementation - Completed
Successfully implemented complete role-specific dashboards for all four remaining stakeholders:

1. **Insurance Company Dashboard** (`/insurance`)
   - Created InsuranceDashboard with overview of policies and claims
   - Created CreatePolicy form for new insurance policy creation
   - Created ClaimsManagement page with claim initiation and approval workflows
   - All connected to existing backend routes with proper API integration

2. **Customs Authority Dashboard** (`/customs`)
   - Created CustomsDashboard with clearance request metrics and status overview
   - Created ClearanceReview page for approve/reject clearance workflows
   - Integrated with customs clearances API endpoints

3. **Port Authority Dashboard** (`/port`)
   - Created PortDashboard with berth allocations and vessel tracking
   - Created CreateOperation form for recording port operations
   - Supports vessel arrivals, berth allocations, and terminal updates

4. **Freight Forwarder Dashboard** (`/forwarder`)
   - Created ForwarderDashboard with coordination overview
   - Created CreateCoordination form for new freight forwarding coordination
   - Integrated with freight forwarder coordination API endpoints

5. **Routing Updates**
   - Updated App.tsx with all role-specific routes
   - All pages properly integrated with existing authentication and navigation

All dashboards follow the IBM Carbon Design System aesthetic with consistent styling, proper error handling, loading states, and responsive TailwindCSS layouts. All LSP errors resolved and application tested successfully.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter, a lightweight React router. The application supports both authenticated and unauthenticated routes, with the Landing page accessible without login and protected routes (Dashboard, Documents, Tracking, Finance, Transactions) requiring authentication.

**State Management**: TanStack Query (React Query) for server state management, with optimistic updates and automatic refetching. Local component state managed with React hooks.

**UI Framework**: Radix UI primitives combined with custom Tailwind CSS styling following the Carbon Design System (IBM) principles. The design system emphasizes professional trustworthiness, clear information hierarchy, and efficiency-focused workflows suitable for enterprise maritime and finance industries.

**Design Tokens**: Custom theme configuration with light/dark mode support, using HSL color values for flexible theming. Typography uses IBM Plex Sans for UI text and IBM Plex Mono for addresses and transaction hashes.

**Component Structure**: Modular component architecture with reusable UI components in `client/src/components/ui/` (shadcn/ui components) and domain-specific components for Bills of Lading, shipment tracking, trade finance panels, and blockchain transaction logs.

**Role-Based UI**: Dynamic interface adaptation based on user roles (shipper, carrier, freight forwarder, customs, bank, port authority), showing role-specific dashboards and actions.

### Backend Architecture

**Runtime**: Node.js with Express.js server framework, written in TypeScript and compiled with esbuild for production.

**API Design**: RESTful API architecture with JSON request/response format. Routes organized by domain (bills of lading, shipments, trade finance, transactions) with authentication middleware protecting all endpoints.

**Authentication**: OpenID Connect (OIDC) integration with Replit Auth using Passport.js strategy. Session management via express-session with PostgreSQL session store (connect-pg-simple) for persistent sessions across server restarts.

**Authorization**: Role-based access control (RBAC) where users have assigned roles (shipper, carrier, customs, admin, etc.) that determine data access and available operations. Middleware functions (`isAuthenticated`, `requireRole`) enforce authorization rules.

**Database Layer**: Abstracted through a storage interface (`IStorage`) allowing swappable implementations. Current implementation uses Drizzle ORM with typed database operations.

**Blockchain Integration**: Separate blockchain service module (`server/blockchain.ts`) that interfaces with BlockDAG network via ethers.js. Supports a "demo mode" toggle for development/testing without actual blockchain calls. The service generates document hashes (SHA-256) and records them on-chain with associated metadata.

**Error Handling**: Centralized error handling with HTTP status codes and descriptive error messages. Unauthorized errors (401) trigger redirect to login flow.

### Data Storage Solutions

**Primary Database**: PostgreSQL (via Neon serverless driver) for all application data including users, bills of lading, shipments, trade finance records, and blockchain transaction logs.

**ORM**: Drizzle ORM providing type-safe database queries and schema migrations. Schema defined in TypeScript (`shared/schema.ts`) and shared between client and server for type consistency.

**Database Schema**:
- **users**: User profiles with Replit Auth integration (id, email, name, profile image, role, company)
- **sessions**: Session storage for authentication persistence
- **billsOfLading**: Digital Bills of Lading with shipper/consignee details, vessel information, cargo description, ports, status tracking, and blockchain hash references
- **shipments**: Cargo tracking records linked to Bills of Lading, containing current location, status, events timeline, and estimated arrival
- **tradeFinance**: Letter of Credit and payment automation records with milestone tracking, payment status, and escrow details
- **transactions**: Blockchain transaction log with transaction hashes, block numbers, gas usage, event types, and timestamps

**Migration Strategy**: Drizzle Kit for schema versioning and migrations, with migration files stored in `/migrations` directory.

**Session Storage**: PostgreSQL-backed session store ensuring sessions survive server restarts and scale horizontally across multiple server instances.

### Authentication and Authorization

**Provider**: Replit Auth (OpenID Connect) with automatic user provisioning on first login.

**Session Management**: Secure HTTP-only cookies with 7-day expiration. Sessions stored in PostgreSQL for persistence and horizontal scalability.

**User Model**: Users identified by OIDC subject claim (sub), with profile data (email, name, profile image) synced from identity provider. Additional attributes (role, company) stored locally.

**Authorization Model**: Role-based access control where:
- **Shippers** can create shipping instructions and Bills of Lading
- **Carriers** can draft eBLs, update shipment status, and manage vessel operations
- **Customs** can review documents and approve clearances
- **Port Authorities** can verify cargo arrivals and grant access
- **Banks** can manage Letters of Credit and payment workflows
- **Admins** have full access to all data and operations

**Security Measures**: CSRF protection via session secret, secure cookies in production (HTTPS-only), token refresh mechanism for long-lived sessions.

## External Dependencies

### Blockchain Network

**BlockDAG Network**: EVM-compatible blockchain with 1400+ TPS throughput and low gas fees. Used for immutable document recording and smart contract execution.

**Connection**: JSON-RPC provider via ethers.js library connecting to BlockDAG testnet at `https://testnet-rpc.blockdag.network`.

**Smart Contracts**: Three core contracts deployed on BlockDAG:
- **BillOfLading.sol**: Manages eBL lifecycle, ownership transfers, status updates, and party authorization
- **ShipmentTracking.sol**: Records immutable shipment events with multi-party verification
- **TradeFinance.sol**: Automates Letter of Credit settlements and escrow-based payments

**Web3 Library**: ethers.js v6 for blockchain interactions, transaction signing, and event monitoring.

### Database Service

**Neon Serverless PostgreSQL**: Managed PostgreSQL with serverless driver for connection pooling and WebSocket support in serverless environments.

**Connection**: WebSocket-based connection via `@neondatabase/serverless` package with fallback to standard PostgreSQL protocol.

### UI Component Libraries

**Radix UI**: Headless, accessible UI primitives for complex components (dialogs, dropdowns, accordions, tabs, tooltips, etc.). Provides ARIA-compliant, keyboard-navigable components.

**shadcn/ui**: Pre-styled Radix UI components following the Carbon Design System aesthetic, customized via Tailwind CSS.

**Lucide React**: Icon library providing consistent iconography across the application.

### Authentication Provider

**Replit Auth**: OAuth 2.0 / OpenID Connect identity provider integrated via `openid-client` library and Passport.js strategy.

**Endpoints**:
- Login: `/api/login` (initiates OIDC flow)
- Callback: `/api/callback` (handles OIDC redirect)
- Logout: `/api/logout` (destroys session and redirects)
- User: `/api/auth/user` (returns current user profile)

### Third-Party Services

**Google Fonts CDN**: IBM Plex Sans and IBM Plex Mono font families loaded from Google Fonts for typography consistency.

**Date Utilities**: date-fns library for date formatting and manipulation (shipment ETAs, transaction timestamps, etc.).

**Validation**: Zod library for runtime type validation and schema enforcement, integrated with Drizzle ORM via drizzle-zod.

**Build Tools**:
- Vite for frontend development and production builds
- esbuild for backend bundling and optimization
- PostCSS with Tailwind CSS for styling compilation
- TypeScript compiler (tsc) for type checking

**Development Tools**:
- Replit-specific plugins for error overlays, cartographer, and dev banners
- Runtime error modal plugin for better debugging experience