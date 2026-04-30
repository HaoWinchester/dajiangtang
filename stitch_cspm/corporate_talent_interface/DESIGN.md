---
name: Corporate Talent Interface
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fc'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e3e1eb'
  on-surface: '#1a1b22'
  on-surface-variant: '#444653'
  inverse-surface: '#2f3037'
  inverse-on-surface: '#f1f0fa'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#2d3449'
  on-tertiary: '#ffffff'
  tertiary-container: '#434b60'
  on-tertiary-container: '#b4bbd5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#fbf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e3e1eb'
typography:
  h1:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  code:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 24px
  margin: 32px
  max_width: 1440px
---

## Brand & Style

The design system is engineered for high-stakes recruitment and human capital management. It prioritizes **authority, efficiency, and clarity**. The brand personality is that of a "Trusted Advisor"—knowledgeable, steady, and precise. 

The chosen style is **Corporate / Modern**. It draws heavily from institutional design standards to ensure familiarity and reduce cognitive load for users managing large datasets. The aesthetic is characterized by a disciplined use of whitespace, a constrained color palette, and a focus on structural integrity over decorative flair. The interface should feel like a high-performance tool, where every pixel serves a functional purpose in the talent acquisition workflow.

## Colors

The palette is anchored by **Professional Navy Blue**, used for primary actions and brand presence to evoke trust and stability. **Slate Gray** provides a sophisticated neutral tone for secondary information and iconography.

The background utilizes a cool **Light Gray** to create a distinct separation from white "Surface" components like cards and tables. This tiered approach reduces eye strain during long periods of data entry. Semantic colors for success, error, and warning are slightly desaturated to maintain the corporate tone while ensuring accessibility and immediate recognition of system states.

## Typography

This design system utilizes **Inter** exclusively to leverage its systematic, utilitarian nature. It is a font designed for screens, providing exceptional legibility in the data-heavy environments typical of talent management.

The hierarchy is strictly enforced. Headlines use tighter letter-spacing and heavier weights for an authoritative feel. Body text relies on a generous line height (1.5x) to ensure large blocks of candidate descriptions or resumes remain readable. Small labels and "Overlines" are set in semi-bold with uppercase styling to categorize data without competing with primary content.

## Layout & Spacing

The design system follows a **Fixed-Fluid Hybrid Grid**. On desktop, content is centered within a 1440px max-width container using a **12-column grid**. Gutters are fixed at 24px to maintain consistent "breathing room" between complex data modules.

The spacing rhythm is based on an **8px linear scale**, allowing for predictable alignment and hierarchy. For dense data tables, a "Compact" mode is supported where internal cell padding reverts to the 4px (base) unit, while standard forms and pages utilize the 16px (md) and 24px (lg) units to ensure a clean, organized appearance.

## Elevation & Depth

Visual hierarchy is established primarily through **Tonal Layering** and **Low-Contrast Outlines**. Because the platform is data-intensive, heavy shadows are avoided to prevent visual clutter.

1.  **Level 0 (Background):** Light Gray (#F8FAFC) - The canvas.
2.  **Level 1 (Surface):** White (#FFFFFF) - Cards, table containers, and navigation bars. These use a 1px border in Slate Gray (at 10% opacity) rather than a shadow.
3.  **Level 2 (Popovers/Dropdowns):** White with an **Ambient Shadow**. The shadow is ultra-diffused: 0px 10px 15px -3px rgba(15, 23, 42, 0.08).
4.  **Interaction:** Hover states on interactive elements use a subtle tonal shift (e.g., a 5% darker background) rather than increasing elevation.

## Shapes

The design system employs **Soft** geometry. A standard radius of **4px (0.25rem)** is applied to buttons, input fields, and small components to provide a modern feel while maintaining a serious, professional edge.

Larger containers like cards or modals may use up to **8px (0.5rem)** for the `rounded-lg` token to soften the overall layout. This subtle rounding distinguishes the platform from legacy "spreadsheet-style" recruitment tools without veering into the playfulness of consumer-grade social apps.

## Components

### Buttons
- **Primary:** Solid Professional Navy Blue with white text. 4px border radius.
- **Secondary:** Slate Gray outline (1px) with Slate Gray text.
- **Tertiary:** Ghost style; text-only until hover, where a light gray background appears.

### Form Inputs & Validation
- **Standard State:** 1px Slate Gray border (#475569 at 30%).
- **Focus State:** 2px Professional Navy Blue ring with a soft outer glow.
- **Validation:** Error states must include both a red border (#B91C1C) and a leading icon for accessibility. Success states are indicated with a subtle green border checkmark.

### Data Tables
- **Header:** Slate Gray background at 5% opacity with bold, uppercase labels.
- **Rows:** Alternating "Zebra" striping is optional; preferred is a 1px bottom border (#F1F5F9).
- **Cells:** Support for "Status Chips" (e.g., "In Review", "Interviewed", "Hired") using muted background tints of the semantic palette.

### Cards
- **Structure:** Simple white background, 1px border, no shadow. 
- **Header:** Optional 1px bottom divider to separate title from content.

### Additional Components
- **Step Indicator:** A linear progress tracker for multi-stage hiring workflows.
- **Candidate Badges:** Compact avatars with initials and a color-coded ring indicating their current recruitment stage.