# ShipLedger Design Guidelines

## Design Approach

**Selected Approach:** Design System - Carbon Design System (IBM)

**Justification:** ShipLedger is an enterprise blockchain platform requiring data-heavy interfaces, complex workflows, and multi-stakeholder collaboration. Carbon Design System excels at handling information-dense applications with clear hierarchy, professional aesthetics, and proven enterprise patterns for dashboards, data tables, and form-heavy interfaces.

**Key Design Principles:**
- Professional trustworthiness for maritime/finance industries
- Clear information hierarchy for complex shipping data
- Efficiency-focused workflows for enterprise users
- Blockchain transparency through visual feedback
- Role-based interface clarity

---

## Typography

**Font Family:**
- Primary: IBM Plex Sans (via Google Fonts CDN)
- Monospace: IBM Plex Mono (for addresses, transaction hashes)

**Scale:**
- Display/Hero: text-5xl (48px) font-semibold
- Page Titles: text-3xl (30px) font-semibold
- Section Headers: text-2xl (24px) font-semibold
- Card Titles: text-xl (20px) font-medium
- Body Text: text-base (16px) font-normal
- Metadata/Labels: text-sm (14px) font-medium
- Captions: text-xs (12px) font-normal

---

## Layout System

**Spacing Units:** Tailwind units of 4, 6, 8, 12, 16 for consistent rhythm
- Component padding: p-6, p-8
- Section spacing: space-y-8, space-y-12
- Card gaps: gap-6
- Page margins: px-8, py-12

**Grid Structure:**
- Dashboard: 12-column grid (grid-cols-12)
- Cards: 3-column on desktop (lg:grid-cols-3), 2-column tablet (md:grid-cols-2), single mobile
- Forms: 2-column layouts for efficiency (lg:grid-cols-2)
- Max container width: max-w-7xl

---

## Component Library

### Navigation & Layout
**Top Navigation Bar:**
- Fixed header with ShipLedger logo (left), role indicator badge (center-left), blockchain status indicator (center-right), user menu (right)
- Height: h-16
- Icons: Heroicons outline style

**Sidebar Navigation:**
- Fixed left sidebar (w-64) with collapsible sections
- Role-based menu items with icon + label
- Active state: subtle background with border-left accent

### Core Components

**Dashboard Cards:**
- Bordered cards with subtle shadow (border rounded-lg shadow-sm)
- Header with icon + title + action button
- Content area with p-6 padding
- Stats cards: Large number display with label and trend indicator

**Data Tables:**
- Striped rows for readability (alternate row backgrounds)
- Sortable column headers with caret icons
- Status badges in table cells (pill-shaped with icon)
- Action dropdown menu (right-aligned)
- Sticky header on scroll

**Forms:**
- Two-column layouts for efficiency
- Clear label hierarchy (text-sm font-medium mb-2)
- Input fields: h-11 with border-2 focus states
- Required field indicators (*)
- Inline validation messages with icons

**Blockchain Transaction Cards:**
- Monospace font for hashes/addresses
- Transaction status timeline (vertical stepper)
- Gas fee and confirmation displays
- Copy-to-clipboard buttons for addresses
- Block explorer link buttons

**Status Indicators:**
- Pill badges: rounded-full px-3 py-1 text-xs font-semibold
- Icons from Heroicons (check-circle, clock, x-circle, truck)
- States: Draft, In Transit, Customs Clearance, Delivered, On Blockchain, Pending Confirmation

**Interactive Elements:**
- Primary buttons: px-6 py-3 rounded-lg font-semibold (for main actions)
- Secondary buttons: outlined variant
- Icon buttons: p-2 for table actions
- No custom hover states needed

### Specialized Components

**Bill of Lading Form:**
- Multi-step wizard interface (stepper at top)
- Grouped sections with clear headings
- Document preview panel (right side on desktop)
- Blockchain submission summary before finalization

**Tracking Timeline:**
- Vertical timeline with location pins
- Event cards with timestamp, location, status
- Interactive map integration placeholder
- Real-time update indicators (pulsing dot)

**Trade Finance Dashboard:**
- Progress bars for payment milestones
- Letter of credit status cards with expandable details
- Payment schedule table
- Smart contract trigger conditions display

**Stakeholder Role Switcher:**
- Dropdown in top nav to simulate different user views
- Visual indicator of current role (badge with icon)
- Role-specific dashboard layouts

---

## Images

**Hero Section:**
- Large hero image showing modern container port with blockchain overlay graphics
- Dimensions: Full-width, h-96 on desktop
- Overlay: dark gradient for text contrast
- CTA buttons with backdrop-blur-sm background

**Dashboard Illustrations:**
- Cargo ship/container icons for empty states
- Blockchain network visualization for transaction explorer
- Document icons for file type indicators
- World map for shipment tracking

**Placeholder Comments:**
```
<!-- HERO IMAGE: Modern container port aerial view with digital overlay -->
<!-- ICON: Shipping container for cargo cards -->
<!-- ICON: Document with blockchain seal for eBL -->
<!-- ICON: Globe with routes for tracking -->
```

---

## Accessibility

- Consistent focus indicators (ring-2 ring-offset-2)
- ARIA labels for all interactive elements
- Keyboard navigation for all workflows
- Screen reader announcements for blockchain confirmations
- Form inputs with explicit labels and error states

---

## Animation Guidelines

**Use Sparingly:**
- Loading spinners for blockchain confirmations only
- Fade-in for notification toasts (top-right)
- No scroll animations
- Subtle transitions on card hover (transition-all duration-200)