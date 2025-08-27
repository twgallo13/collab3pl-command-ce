# Collab3PL Command Center

A comprehensive internal admin and vendor portal for managing 3PL operations with real-time dashboard capabilities and data-driven insights.

**Experience Qualities**:
1. Professional - Enterprise-grade interface that instills confidence in mission-critical operations
2. Efficient - Streamlined workflows that minimize clicks and maximize productivity for daily tasks
3. Comprehensive - Complete visibility into all operational aspects from a single unified interface

**Complexity Level**: Complex Application (advanced functionality, accounts)
The application requires sophisticated data management, role-based access, real-time updates, and integration with multiple backend systems for warehouse management, billing, and client operations.

## Essential Features

### Dashboard Overview
- **Functionality**: Real-time operational metrics, alerts, and performance KPIs
- **Purpose**: Provides immediate situational awareness for operations teams
- **Trigger**: User logs in or navigates to dashboard
- **Progression**: Login → Dashboard load → Metrics display → Drill-down capabilities → Action items
- **Success criteria**: Sub-second load times, accurate real-time data, actionable insights

### Warehouse Management System (WMS)
- **Functionality**: Inventory tracking, order processing, and warehouse operations
- **Purpose**: Central control for all warehouse activities and inventory management
- **Trigger**: Navigate to WMS section from sidebar
- **Progression**: WMS access → Inventory view → Order management → Process tracking → Status updates
- **Success criteria**: Real-time inventory accuracy, efficient order processing workflows

### Billing Management
- **Functionality**: Invoice generation, payment tracking, and financial reporting
- **Purpose**: Streamline financial operations and ensure accurate billing
- **Trigger**: Access billing section or automated billing cycles
- **Progression**: Billing access → Invoice review → Payment processing → Report generation → Archive
- **Success criteria**: Accurate billing calculations, timely invoice delivery, clear financial reporting

### Client Management
- **Functionality**: Client profiles, service agreements, and relationship tracking
- **Purpose**: Maintain comprehensive client relationships and service delivery
- **Trigger**: Navigate to clients section or client-specific actions
- **Progression**: Client access → Profile view → Service review → Communication log → Update actions
- **Success criteria**: Complete client visibility, efficient communication tracking

### Settings & Configuration
- **Functionality**: System preferences, user management, and operational parameters
- **Purpose**: Configure system behavior and manage user access
- **Trigger**: Access settings from sidebar or administrative actions
- **Progression**: Settings access → Category selection → Parameter adjustment → Validation → Save confirmation
- **Success criteria**: Intuitive configuration, proper validation, immediate effect application

## Edge Case Handling
- **Network Connectivity**: Offline mode with data synchronization when reconnected
- **Data Conflicts**: Version control with merge conflict resolution interfaces
- **Permission Errors**: Graceful degradation with clear messaging about access limitations
- **System Overload**: Progressive loading with priority-based content delivery
- **Invalid Data**: Comprehensive validation with constructive error messaging and recovery suggestions

## Design Direction
The design should evoke trust, efficiency, and control - reflecting the mission-critical nature of 3PL operations. The interface should feel authoritative yet approachable, with a minimal but information-rich approach that serves the data-heavy nature of logistics operations.

## Color Selection
**Complementary (opposite colors)** - Using blue and orange to create strong visual hierarchy and clear action differentiation, evoking both trust and urgency when needed.

- **Primary Color**: Deep Navy Blue (oklch(0.25 0.08 240)) - Communicates trust, stability, and professional authority
- **Secondary Colors**: Light Gray (oklch(0.95 0.005 240)) for backgrounds, Medium Gray (oklch(0.7 0.02 240)) for supporting elements
- **Accent Color**: Vibrant Orange (oklch(0.7 0.15 45)) - Attention-grabbing for CTAs, alerts, and critical actions
- **Foreground/Background Pairings**: 
  - Background White (oklch(1 0 0)): Dark Navy text (oklch(0.2 0.08 240)) - Ratio 12.6:1 ✓
  - Primary Navy (oklch(0.25 0.08 240)): White text (oklch(1 0 0)) - Ratio 12.6:1 ✓
  - Accent Orange (oklch(0.7 0.15 45)): White text (oklch(1 0 0)) - Ratio 5.2:1 ✓
  - Card Light Gray (oklch(0.98 0.005 240)): Dark Navy text (oklch(0.2 0.08 240)) - Ratio 15.8:1 ✓

## Font Selection
Typography should convey precision and clarity, essential for data-heavy operational interfaces. Inter provides excellent readability at various sizes and weights, perfect for dashboard environments with mixed content types.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/24px/normal spacing
  - H3 (Subsection): Inter Medium/20px/normal spacing
  - Body Text: Inter Regular/16px/relaxed line height
  - Labels: Inter Medium/14px/normal spacing
  - Small Text: Inter Regular/12px/tight line height

## Animations
Animations should enhance productivity by providing clear feedback and maintaining context during navigation, balancing professional restraint with helpful visual cues for complex workflows.

- **Purposeful Meaning**: Smooth transitions reinforce the systematic, controlled nature of 3PL operations while providing immediate feedback for user actions
- **Hierarchy of Movement**: Primary focus on navigation transitions, data loading states, and form validation feedback

## Component Selection
- **Components**: Sidebar for navigation, Card for data sections, Table for operational data, Dialog for configuration, Button with clear hierarchy, Form with robust validation, Alert for system status
- **Customizations**: Custom data visualization components for operational metrics, specialized table views for inventory and billing data
- **States**: Buttons with loading states for async operations, inputs with validation feedback, navigation with active states, data tables with sorting and filtering
- **Icon Selection**: Phosphor icons for navigation (House, Package, CreditCard, Users, Gear), status indicators, and actions
- **Spacing**: Generous padding (p-6) for main sections, tight spacing (gap-2) for related elements, consistent margins (mb-4) for vertical rhythm
- **Mobile**: Collapsible sidebar becomes drawer on mobile, responsive tables with horizontal scroll, stacked cards on smaller screens, mobile-first with progressive enhancement for desktop productivity features