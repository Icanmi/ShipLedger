# ShipLedger Design Guidelines

## Design Approach

**Selected Approach:** Design System (Hybrid Material + Carbon Design)
**Rationale:** ShipLedger is an enterprise logistics platform requiring clarity, efficiency, and data density. The design prioritizes information architecture, scannable layouts, and professional credibility over visual experimentation.

**Reference Inspiration:** Flexport (logistics clarity), Linear (clean data presentation), Stripe (trust and professionalism)

**Core Design Principles:**
- Data-first hierarchy: Information accessibility over decorative elements
- Enterprise trust: Professional, secure, authoritative visual language
- Progressive disclosure: Complex workflows broken into digestible steps
- Status-driven design: Clear visual indicators for shipment states and document statuses

---

## Typography

**Font Families:**
- Primary: Inter (via Google Fonts) - headings, labels, UI elements
- Secondary: JetBrains Mono - transaction IDs, blockchain hashes, container numbers

**Type Scale:**
- Page Headers: text-3xl font-semibold (dashboard titles)
- Section Headers: text-xl font-semibold (card titles, workflow steps)
- Subsections: text-lg font-medium (data categories)
- Body Text: text-base font-normal (shipment details, descriptions)
- Labels: text-sm font-medium uppercase tracking-wide (form labels, status tags)
- Metadata: text-sm font-normal (timestamps, secondary info)
- Monospace: text-sm (transaction hashes, container/BoL numbers)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, and 16
- Tight spacing: p-2, gap-2 (within grouped elements)
- Standard spacing: p-4, gap-4 (card internal padding, form fields)
- Section spacing: p-6, gap-6 (between card sections)
- Component spacing: p-8, gap-8 (between major UI blocks)
- Page margins: px-12, py-8 (content containers)
- Large gutters: gap-16 (dashboard grid spacing)

**Grid Structure:**
- Dashboard: 12-column grid (lg:grid-cols-12) for flexible layouts
- Sidebar: Fixed 280px width (hidden on mobile, toggle menu)
- Main content: Fluid with max-w-7xl container
- Cards: Grid of 2-4 columns based on viewport (md:grid-cols-2 lg:grid-cols-3)

---

## Component Library

### Navigation & Layout

**Top Navigation Bar:**
- Fixed header at 64px height (h-16)
- Contains: Logo (left), role switcher dropdown (center-left), notifications bell, user avatar (right)
- Add blockchain sync status indicator (green dot + "Synced" label)

**Sidebar Navigation:**
- Collapsible sidebar with icon + label pattern
- Sections: Dashboard, Shipments, Documents, Tracking, Blockchain Explorer, Settings
- Active state: Filled background, bold text
- Include role badge at bottom (e.g., "Shipper", "Carrier")

**Role-Based Header:**
- Prominent role indicator badge below top nav
- Shows current viewing mode: "Viewing as: Shipper" with ability to switch roles for demo

### Dashboard Components

**Metrics Overview Cards (Hero Section):**
- Grid of 4 cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Each card shows: Icon, metric value (text-3xl font-bold), label, trend indicator
- Metrics: Active Shipments, Pending Documents, Blockchain Transactions, Avg. Processing Time

**Shipment Status Table:**
- Sortable data table with: Container ID, BoL Number, Status Badge, Origin → Destination, ETA, Actions
- Status badges: Pill-shaped with specific states (Draft, In Transit, At Port, Delivered, Blocked)
- Row actions: "View Details" button, "Track" icon button

**Recent Activity Feed:**
- Timeline-style component with left border accent
- Each item: Timestamp, actor (with avatar), action description, affected document/shipment
- Blockchain transaction hash in monospace (truncated with tooltip)

**Document Cards:**
- Visual card grid for Bill of Lading documents
- Each card: Document icon, BoL number, shipper name, status, date, "View/Download" actions
- Add "Blockchain Verified" checkmark badge

### Workflow Components

**Stepper/Progress Indicator:**
- Horizontal workflow steps for "Upload Instructions → Draft BoL → Share with Parties → Complete"
- Completed steps: Checkmark, active step: pulsing indicator, future steps: outlined
- Show step number, title, and optional timestamp

**Upload Interface:**
- Drag-and-drop zone with dashed border (border-2 border-dashed)
- File type restrictions: ".pdf, .xml, .json accepted"
- Show uploaded file preview with name, size, remove option

**Bill of Lading Form:**
- Multi-section form with clear visual groupings
- Sections: Shipper Details, Consignee Details, Cargo Description, Container Info, Route
- Use input groups with floating labels
- Add "Save Draft" and "Submit for Approval" buttons at bottom

**Notification Panel:**
- Slide-over panel from right side
- List of notifications with: Icon, title, timestamp, read/unread state
- Include action buttons for "Approve BoL", "View Shipment", etc.

### Data Visualization

**Shipment Tracking Map (Simplified):**
- Container/card showing route visualization
- Text-based stages: Port of Origin → In Transit → Port of Destination
- Progress bar connecting stages with current position indicator
- Add estimated dates under each stage

**Blockchain Transaction Log:**
- Table-style list with: Transaction Hash (truncated), Event Type, Timestamp, Block Number, Gas Used
- "View on BlockDAG Explorer" external link button
- Expandable row for full transaction details

**Event Timeline:**
- Vertical timeline for shipment's 120+ events
- Grouped by date with collapsible sections
- Each event: Icon, event name, precise timestamp, location, responsible party

### Interactive Elements

**Buttons:**
- Primary: Solid, font-semibold (e.g., "Submit BoL", "Confirm Shipment")
- Secondary: Outlined (e.g., "Save Draft", "Cancel")
- Tertiary: Ghost/text-only (e.g., "View Details", "Learn More")
- Icon buttons: Consistent 40px touch target (w-10 h-10)

**Input Fields:**
- Standard height: h-12
- Rounded corners: rounded-md
- Clear focus states with ring emphasis
- Prefix icons for specialized inputs (search icon, calendar icon)

**Modal Dialogs:**
- Centered overlay with backdrop blur
- Max-width: max-w-2xl for forms, max-w-4xl for document previews
- Header with title + close button, content area, footer with actions

**Status Badges:**
- Pill-shaped: rounded-full px-3 py-1
- Sizes: Small (text-xs), Medium (text-sm)
- States with semantic meaning: Draft, Pending, In Transit, At Port, Delivered, Issue, Verified

---

## Images

**No large hero images.** This is an enterprise dashboard focused on data and functionality.

**Icons:**
- Use Heroicons (via CDN) for all interface icons
- Contextual icons: Ship/anchor for shipments, document icon for BoL, shield for blockchain, globe for tracking
- Icon size: w-5 h-5 for inline, w-6 h-6 for buttons, w-8 h-8 for cards

**Decorative Elements:**
- Subtle grid/dot pattern background for empty states
- Blockchain visualization: Minimal connected node illustration for blockchain explorer section
- Document preview thumbnails (mocked as simple document icon + filename)

---

## Accessibility

- All interactive elements: min-height of 44px for touch targets
- Form inputs: Associated labels with for/id attributes
- Status indicators: Text labels accompanying any icon/visual cues
- Focus visible: Clear ring-2 focus states on all interactive elements
- Semantic HTML: Use proper heading hierarchy (h1 → h2 → h3)
- Skip navigation link for keyboard users
- ARIA labels for icon-only buttons

---

## Animation (Minimal)

- Page transitions: None
- Loading states: Simple spinner for data fetching
- Notification toasts: Slide in from top-right (duration-300)
- Dropdown menus: Subtle fade-in (transition-opacity)
- No scroll-triggered animations or parallax effects

---

## Responsive Behavior

**Mobile (< 768px):**
- Hamburger menu for sidebar navigation
- Stack all dashboard cards vertically
- Data tables become scrollable cards with key info visible
- Sticky header with critical actions

**Tablet (768px - 1024px):**
- Collapsible sidebar that overlays content
- 2-column card grids
- Compact table views

**Desktop (> 1024px):**
- Persistent sidebar navigation
- Full data table layouts with all columns
- 3-4 column dashboard grids
- Multi-panel views (e.g., shipment list + details panel)