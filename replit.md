# Retail Bandhu

## Overview

Retail Bandhu is a digital platform that connects small retailers, wholesalers, and delivery partners in India's FMCG supply chain. The platform facilitates ordering, inventory tracking, payments, and delivery management through a unified web application.

**Core Purpose:** Digitizing India's retail supply chain by providing retailers easy access to wholesalers, streamlined order processing, real-time inventory management, and integrated payment solutions.

**Target Users:**
- Retailers: Browse wholesalers, place orders, track deliveries, manage payments
- Wholesalers: Manage product catalogs, process orders, track inventory, handle dispatches
- Delivery Partners: Accept deliveries, track routes, collect payments, submit delivery proofs
- Admins: User management, transaction monitoring, dispute resolution

## Recent Changes

**October 2025 - Vercel to Replit Migration:**
- Migrated Next.js application from Vercel to Replit platform
- Fixed React compatibility issue (removed unsupported cache import from React 18.0.0)
- Configured development server: port 5000, host 0.0.0.0 for Replit environment
- Set up autoscale deployment with pnpm build/start commands
- Configured environment secrets via Replit Secrets system
- All core functionality verified and working (auth, database, UI)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** Next.js 14 with App Router
- Server and client components architecture
- File-based routing with nested layouts
- Server-side rendering for SEO and performance
- Client-side interactivity for dynamic features

**UI Components:** shadcn/ui built on Radix UI primitives
- Consistent design system with Tailwind CSS
- Accessible, customizable component library
- Dark mode support via next-themes
- Responsive mobile-first design

**State Management:**
- React Context for global state (auth, notifications, orders, location, messaging)
- Client component state for UI interactions
- Real-time subscriptions for live updates

**Key Design Patterns:**
- Role-based routing and access control
- Unified navigation with role-specific menus
- Protected routes with authentication guards
- Error boundaries at multiple levels (page, global)
- Loading states and skeleton screens

### Backend Architecture

**Authentication & Authorization:**
- Supabase Auth for user management
- Role-based access control (retailer, wholesaler, delivery_partner, admin)
- Profile-based user data with approval workflow
- Middleware for session management and route protection

**Database Design:**
- PostgreSQL via Supabase
- Key tables: profiles, orders, order_items, products, delivery_partners, notifications, messages
- Row-level security policies for data isolation
- Relational data with foreign keys and joins

**API Structure:**
- Next.js API routes for server-side operations
- Server actions for mutations
- Real-time subscriptions via Supabase channels
- Service role client for admin operations

**Core Services:**
- Order Service: Comprehensive order lookup with multiple fallback strategies
- Notification Service: Unified notification creation and delivery
- Location Service: GPS tracking for delivery partners
- Messaging Service: In-app communication between users
- Inventory Service: Stock management and alerts

### External Dependencies

**Primary Services:**
- **Supabase:** Backend-as-a-Service for authentication, database, and real-time features
  - PostgreSQL database
  - Authentication and user management
  - Real-time subscriptions
  - Storage for media files

**Payment Integration:**
- **PayU:** Payment gateway for UPI and digital payments
  - Hash generation for secure transactions
  - Webhook handling for payment status
  - Support for UPI, cards, and other methods

**AI & Analytics:**
- **OpenAI SDK (@ai-sdk/openai):** AI-powered chat support and assistance
- Vercel AI SDK for streaming responses

**Third-Party Integrations:**
- **Google Photos API:** Image uploads for products and delivery proofs
  - OAuth2 authentication flow
  - Token management and refresh
  - Media library access

**Development Tools:**
- TypeScript for type safety
- Zod for schema validation
- React Hook Form for form management
- TanStack Table for data tables
- Lucide React for icons

**Deployment:**
- Replit for hosting and development (migrated from Vercel - October 2025)
- Autoscale deployment configured with Next.js
- Development server runs on port 5000 with 0.0.0.0 binding
- Environment-based configuration via Replit Secrets
- Edge middleware for performance

**Notable Technical Decisions:**
1. **Multiple Supabase Clients:** Separate clients for server components, client components, and service role operations to maintain security boundaries
2. **Order Lookup Strategy:** Multi-strategy order search (direct UUID, prefix matching, manual search) to handle partial IDs and user-friendly references
3. **Notification System:** Unified service that works across server and client contexts with consistent API
4. **Real-time Updates:** Supabase subscriptions for live order status, messages, and notifications
5. **Role-based Navigation:** Dynamic navigation menus that adapt to user roles with guards preventing unauthorized access
6. **Error Handling:** Layered error boundaries (component, page, global) with user-friendly messages and development details
7. **Barcode Detection:** ZXing library for product scanning and inventory management