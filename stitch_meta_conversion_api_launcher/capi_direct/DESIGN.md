---
name: CAPI Direct
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#424754'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727786'
  outline-variant: '#c2c6d6'
  surface-tint: '#0059c8'
  primary: '#004db0'
  on-primary: '#ffffff'
  primary-container: '#0064e0'
  on-primary-container: '#e6ebff'
  inverse-primary: '#afc6ff'
  secondary: '#00696f'
  on-secondary: '#ffffff'
  secondary-container: '#00f1fd'
  on-secondary-container: '#006a6f'
  tertiary: '#45555d'
  on-tertiary: '#ffffff'
  tertiary-container: '#5d6d76'
  on-tertiary-container: '#deeffa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001944'
  on-primary-fixed-variant: '#004299'
  secondary-fixed: '#6ff6ff'
  secondary-fixed-dim: '#00dce6'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f53'
  tertiary-fixed: '#d5e5f0'
  tertiary-fixed-dim: '#b9c9d3'
  on-tertiary-fixed: '#0e1d25'
  on-tertiary-fixed-variant: '#3a4951'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
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
  code-snippet:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '450'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-gap: 16px
---

## Brand & Style

The design system is engineered for technical efficiency and absolute reliability. It targets developers and performance marketers who require a frictionless, high-speed interface for managing complex data pipelines. 

The aesthetic sits at the intersection of **Corporate Modern** and **Geist-inspired Minimalism**. It utilizes high-precision layouts, generous whitespace, and a disciplined color application to reduce cognitive load during technical setups. The emotional response is one of calm authority—a "set it and forget it" tool that feels like a native extension of a developer's existing high-end toolkit.

## Colors

The palette is anchored by a deep **Meta Blue** (#0064E0) to establish an immediate mental connection with the ecosystem. This is complemented by an **Electric Cyan** (#00F3FF) used sparingly for high-value status indicators and subtle data-flow animations. 

Surface colors rely on a "Slate" scale, moving from a pure white background to light gray borders and deep slate text. Success states use a vibrant emerald, while errors utilize a crisp, high-visibility red to ensure technical issues are never overlooked.

## Typography

This design system utilizes **Inter** for all UI elements to ensure maximum legibility across dense data views. The weight distribution is intentional: Bold for headers to establish hierarchy, and Regular for body text to maintain a lightweight feel.

For technical data, IDs, and API payloads, **JetBrains Mono** is employed. This monospaced font provides the precision needed for debugging and differentiates static content from dynamic, machine-generated data.

## Layout & Spacing

The system follows a strict **8px grid** (with 4px sub-units) to maintain mathematical harmony. 

- **Desktop:** 12-column fluid grid. Content is centered within a 1280px max-width container. 
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins. 

Layouts should prioritize vertical stacking for configuration forms and horizontal distribution for dashboard metrics. Use a consistent `stack-gap` of 16px between related form fields and 32px between logical sections.

## Elevation & Depth

To maintain a "lightweight" feel, this design system avoids heavy shadows. Instead, it utilizes **Low-contrast outlines** and **Tonal layers**.

- **Level 0 (Background):** Pure White (#FFFFFF).
- **Level 1 (Cards/Sidebar):** Light Gray Stroke (1px, #E2E8F0) with a subtle 2px soft blur shadow (RGBA 0, 0, 0, 0.04).
- **Level 2 (Modals/Popovers):** Higher contrast border (#CBD5E1) with a more defined 12px ambient shadow (RGBA 0, 0, 0, 0.08).

Interactive elements should use a "lift" effect on hover, increasing the shadow depth slightly rather than changing the background color significantly.

## Shapes

The design system uses **Soft (0.25rem)** roundedness for standard elements like buttons and inputs to convey a modern, approachable feel without appearing juvenile. 

Larger containers, such as dashboard cards, use `rounded-lg` (0.5rem) to soften the overall interface. Interactive icons and "status dots" remain circular. The precision of these tight corners reinforces the technical nature of the SaaS tool.

## Components

### Buttons
- **Primary:** Solid #0064E0 with white text. No gradient.
- **Secondary:** Transparent background with #0064E0 border and text.
- **Ghost:** No border or background. Becomes light gray on hover.

### Code Snippets
- Encapsulated in a dark container (#1C2B33).
- Uses JetBrains Mono.
- Includes a "Copy" icon button in the top right corner that provides visual "Copied!" feedback.

### Cards
- White background with a 1px #E2E8F0 border.
- 24px internal padding.
- Used for grouping setup steps or displaying individual event metrics.

### Status Indicators
- **Active:** Electric Cyan pulse or solid dot.
- **Pending:** Amber/Orange.
- **Error:** High-contrast Red.

### Inputs
- Standard height: 40px.
- Border: 1px #CBD5E1.
- Focus State: 2px #0064E0 ring with 0px offset.