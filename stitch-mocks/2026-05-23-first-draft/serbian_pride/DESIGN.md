---
name: Serbian Pride
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#59413f'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8d706e'
  outline-variant: '#e1bebc'
  surface-tint: '#b32830'
  primary: '#a41b27'
  on-primary: '#ffffff'
  primary-container: '#c6363c'
  on-primary-container: '#ffeae8'
  inverse-primary: '#ffb3b0'
  secondary: '#355f97'
  on-secondary: '#ffffff'
  secondary-container: '#98c0fe'
  on-secondary-container: '#214e84'
  tertiary: '#6e4d25'
  on-tertiary: '#ffffff'
  tertiary-container: '#89653b'
  on-tertiary-container: '#ffebd9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b0'
  on-primary-fixed: '#410006'
  on-primary-fixed-variant: '#91081c'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#a6c8ff'
  on-secondary-fixed: '#001c3b'
  on-secondary-fixed-variant: '#18477e'
  tertiary-fixed: '#ffddb9'
  tertiary-fixed-dim: '#ecbe8d'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#5f401a'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style
The design system is engineered for a language-learning experience that feels both authoritative and high-energy. It balances the heritage of Serbian culture with a modern, high-performance educational interface. The brand personality is patriotic but welcoming, professional yet vibrant.

The aesthetic follows a **Corporate / Modern** direction with **Tactile** accents. It utilizes a clean, structured layout to facilitate focus, while integrating subtle cultural motifs—specifically the four firesteels (SSSS)—as watermark textures or iconographic details to instill a sense of pride and place. The UI evokes a feeling of structured progress and cultural immersion.

## Colors
This design system utilizes the tricolor palette of the Serbian flag, reimagined for digital legibility and hierarchy.

- **Primary (Red):** Used for primary actions, progress indicators, and high-energy touchpoints.
- **Secondary (Blue):** Applied to navigation elements, headers, and instructional components to provide a stable, professional grounding.
- **Tertiary (Gold):** Reserved for achievements, premium features, and decorative heraldic motifs.
- **Neutral:** A soft off-white (`#F8F9FA`) serves as the primary background to reduce eye strain during long study sessions, while a slate gray is used for secondary text and borders.

## Typography
The typography strategy prioritizes clarity and strength. **Montserrat** is the voice of the brand, used for headlines to convey confidence and modernity. **Source Sans 3** provides a highly legible, neutral environment for instructional body text and Cyrillic/Latin character comparison. **Lexend** is employed for UI labels and data-heavy components (like vocabulary lists) to maximize readability and accessibility.

## Layout & Spacing
The design system employs a **Fixed Grid** model for desktop and a **Fluid Grid** for mobile devices. 

- **Desktop:** A 12-column grid centered in a 1200px container.
- **Tablet:** An 8-column grid with 24px margins.
- **Mobile:** A 4-column grid with 16px margins.

The spacing rhythm is based on an 8px square-grid system. Large vertical gaps (xl) are used to separate learning modules, while tighter spacing (sm) groups related interactive elements like quiz options.

## Elevation & Depth
Depth is created through **Tonal Layers** supplemented by **Ambient Shadows**.

1.  **Level 0 (Base):** Off-white background (`#F8F9FA`).
2.  **Level 1 (Cards):** Pure white surfaces with a subtle 1px stroke (`#E9ECEF`) and a soft, low-opacity shadow (4% alpha) to suggest lift.
3.  **Level 2 (Interactive):** Elements like active buttons or focused inputs use a slightly deeper shadow (8% alpha) with a primary red tint to emphasize interactivity.
4.  **Level 3 (Overlays):** Modals and dropdowns use high-diffusion shadows and a 20% backdrop dim to isolate the task.

## Shapes
The design system utilizes a **Medium (Rounded)** corner language. This 8px (0.5rem) base radius provides a friendly, approachable feel that remains professional. 

- **Standard Buttons & Inputs:** 8px radius.
- **Large Cards & Modals:** 16px (rounded-lg) to soften the layout.
- **Selection Chips:** Full pill-shape (rounded-xl) to differentiate them from actionable buttons.

## Components
- **Buttons:** Primary buttons are solid Red with white text. Secondary buttons use a Blue outline. Tertiary (Gold) is used for "Correct Answer" feedback or "Level Up" states.
- **Input Fields:** Use a white background with a subtle gray border. On focus, the border transitions to Blue with a 2px thickness.
- **Learning Cards:** Large white surfaces containing lesson content. These should feature the four firesteels ('S') as a very faint, 2% opacity background pattern to reinforce the cultural theme.
- **Progress Bars:** Dual-tone bars using Secondary Blue for the track and Primary Red for the fill.
- **Achievement Badges:** Circular elements utilizing Gold accents and heraldic-inspired iconography (crowns, shields, firesteels).
- **Selection Lists:** List items for quizzes use a 1px border that turns Green for success or Red for errors, providing immediate haptic and visual feedback.