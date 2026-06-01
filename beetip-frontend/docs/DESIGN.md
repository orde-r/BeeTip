# Campus Velocity Design System

Source: Stitch project `Campus Jastip Connect` (`projects/3087915258908316182`)

Device target: Mobile  
Color mode: Light  
Color variant: Fidelity  
Primary font: Montserrat  
Body font: Inter  
Spacing scale: 2  
Roundness: `ROUND_EIGHT`

## Color Tokens

| Token | Hex |
| --- | --- |
| `surface` | `#f8f9fb` |
| `surface-dim` | `#d9dadc` |
| `surface-bright` | `#f8f9fb` |
| `surface-container-lowest` | `#ffffff` |
| `surface-container-low` | `#f3f4f6` |
| `surface-container` | `#edeef0` |
| `surface-container-high` | `#e7e8ea` |
| `surface-container-highest` | `#e1e2e4` |
| `on-surface` | `#191c1e` |
| `on-surface-variant` | `#434655` |
| `inverse-surface` | `#2e3132` |
| `inverse-on-surface` | `#f0f1f3` |
| `outline` | `#737686` |
| `outline-variant` | `#c3c6d7` |
| `surface-tint` | `#0053db` |
| `primary` | `#004ac6` |
| `on-primary` | `#ffffff` |
| `primary-container` | `#2563eb` |
| `on-primary-container` | `#eeefff` |
| `inverse-primary` | `#b4c5ff` |
| `secondary` | `#855300` |
| `on-secondary` | `#ffffff` |
| `secondary-container` | `#fea619` |
| `on-secondary-container` | `#684000` |
| `tertiary` | `#006242` |
| `on-tertiary` | `#ffffff` |
| `tertiary-container` | `#007d55` |
| `on-tertiary-container` | `#bdffdb` |
| `error` | `#ba1a1a` |
| `on-error` | `#ffffff` |
| `error-container` | `#ffdad6` |
| `on-error-container` | `#93000a` |
| `primary-fixed` | `#dbe1ff` |
| `primary-fixed-dim` | `#b4c5ff` |
| `on-primary-fixed` | `#00174b` |
| `on-primary-fixed-variant` | `#003ea8` |
| `secondary-fixed` | `#ffddb8` |
| `secondary-fixed-dim` | `#ffb95f` |
| `on-secondary-fixed` | `#2a1700` |
| `on-secondary-fixed-variant` | `#653e00` |
| `tertiary-fixed` | `#6ffbbe` |
| `tertiary-fixed-dim` | `#4edea3` |
| `on-tertiary-fixed` | `#002113` |
| `on-tertiary-fixed-variant` | `#005236` |
| `background` | `#f8f9fb` |
| `on-background` | `#191c1e` |
| `surface-variant` | `#e1e2e4` |

## Project Color Overrides

| Token | Hex |
| --- | --- |
| `customColor` | `#2563eb` |
| `overridePrimaryColor` | `#2563eb` |
| `overrideSecondaryColor` | `#f59e0b` |
| `overrideTertiaryColor` | `#10b981` |
| `overrideNeutralColor` | `#f3f4f6` |

## Color Usage Rules

- Campus Blue is used for navigation, branding, and verified states.
- Energetic Orange is reserved for primary calls to action and "New Request" triggers.
- Success Green is applied to completed deliveries, earnings, and positive confirmations.
- Soft Gray is the foundation for backgrounds and surface separations.
- Surface cards should remain predominantly `#ffffff`.
- The global page background should use `#f3f4f6` for subtle depth.
- Level 0 floor background: `#f3f4f6`.
- Level 1 cards: white surfaces with a 4px blur and 2% opacity black shadow.
- Level 2 active or floating surfaces: white surfaces with an 8px blur and 6% opacity shadow.
- Input fields and inactive states use a 1px solid `#e5e7eb` border.
- Search and form fields use `#f9fafb` fill and a 1px border that turns Campus Blue on focus.

## Typography Scale

| Style | Font family | Font size | Font weight | Line height | Letter spacing |
| --- | --- | --- | --- | --- | --- |
| `page-title` | Montserrat | `24px` | `600` | `32px` | `0` |
| `metric-lg` | Montserrat | `28px` | `700` | `36px` | `0` |
| `security-code` | Montserrat | `30px` | `700` | `36px` | `0` |
| `section-title` | Montserrat | `20px` | `600` | `28px` | `0` |
| `card-title` | Montserrat | `18px` | `600` | `28px` | `0` |
| `body-md` | Inter | `14px` | `400` | `20px` | `0` |
| `body-md-strong` | Inter | `14px` | `600` | `20px` | `0` |
| `caption` | Inter | `12px` | `400` | `20px` | `0` |
| `label-md` | Inter | `12px` | `600` | `16px` | `0.05em` |
| `chip-label` | Inter | `11px` | `600` | `16px` | `0.025em` |

## Typography Rules

- Use Montserrat for headings.
- Use Inter for functional text and body copy.
- Keep page titles compact at `24px / 32px`; reserve `28px / 36px` for balance and dashboard metrics.
- Use `20px / 28px` for section titles and form-panel headings.
- Use `18px / 28px` for compact card and outcome-panel titles.
- Use `14px / 20px` for buttons, form fields, rows, notices, and primary body text.
- Use `12px` captions for dense card descriptions and metadata, with `20px` line height when wrapping is likely.
- Use `label-md` in all caps with increased letter spacing for metadata labels.
- Use `chip-label` for compact status chips.
- Do not use negative letter spacing.
- Maintain high contrast for body text against backgrounds.

## Spacing Tokens

| Token | Value |
| --- | --- |
| `base` | `4px` |
| `xs` | `4px` |
| `sm` | `8px` |
| `md` | `16px` |
| `lg` | `24px` |
| `xl` | `32px` |
| `gutter` | `16px` |
| `margin-mobile` | `20px` |

## Spacing Rules

- Follow a Fluid 8pt Grid system adapted for mobile devices.
- Use a standard `20px` side margin on mobile screens.
- Use `16px` gutters between cards and grid items.
- Use `md` (`16px`) for vertical rhythm between related elements.
- Use `lg` (`24px`) for spacing between distinct sections.
- Use single-column layouts for content feeds.
- Place critical action buttons in the bottom third of the screen for thumb-zone ergonomics.

## Shape Tokens

| Token | Value |
| --- | --- |
| `sm` | `0.25rem` |
| `DEFAULT` | `0.5rem` |
| `md` | `0.75rem` |
| `lg` | `1rem` |
| `xl` | `1.5rem` |
| `full` | `9999px` |

## Shape Rules

- Use `16px` (`rounded-lg`) for main cards, containers, and primary buttons.
- Use `8px` (`rounded-md`) for smaller elements such as input fields and notification badges.
- Use fully rounded pill shapes only for status chips and tags.

## Component Rules

- Primary buttons use solid Energetic Orange with white text, 16px border radius, and a subtle shadow. They are full width on mobile.
- Secondary buttons use solid Campus Blue with white text for actions such as "View Details" or "Message".
- Ghost buttons are transparent with a Campus Blue outline.
- Delivery cards use 16px rounded corners, white background, and a 1px light gray border.
- Status chips use a pill shape with a light tint of the status color.
- Outcome panels use compact `18px` titles, `12px` descriptions, and optional metadata rows only when the value adds useful context.
- The Velocity Bottom Bar is a floating navigation bar with 24px rounded corners and a persistent "New Request" button centered or docked to the right in Energetic Orange.
- Progress trackers use Campus Blue for completed steps and Soft Gray for upcoming steps.
