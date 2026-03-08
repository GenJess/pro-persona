

## ProPersona -- Elite UI & UX Overhaul

The current app is functional but visually flat and generic. Here's the plan to make it feel premium, polished, and marketable.

### 1. Landing Page (Index.tsx) -- Complete Redesign

- Add animated gradient background orb/blob behind hero for visual depth
- Add a "social proof" / stats section (e.g., "100+ Personas Created", "AI-Powered Conversations")
- Add a step-by-step "How It Works" section with numbered steps and subtle connecting lines
- Add a CTA section at the bottom before footer
- Smooth fade-in animations on scroll using CSS keyframes
- Better typography hierarchy and spacing

### 2. Header (Header.tsx) -- Premium Polish

- Add subtle glass-morphism effect (already has backdrop-blur, enhance it)
- Smooth mobile menu animation (slide-down transition instead of instant show/hide)
- Add gradient hover effects on CTA button

### 3. Public Personas Page -- Gallery Upgrade

- Fetch and display user names from profiles table (join query)
- Add hover card animations with scale + shadow lift
- Add search/filter placeholder for future scalability
- Staggered card entrance animations
- Better empty state with illustration

### 4. Account Page -- Dashboard Feel

- Add a hero banner at top with gradient background
- Better card layout with icon backgrounds
- Copy-to-clipboard for conversation link
- Animated status badges

### 5. Sign Up & Sign In -- Conversion Optimized

- Add a side illustration/branding panel on desktop (split layout)
- Better form field focus states with animated borders
- Progress indicator during account creation
- Password strength indicator on signup

### 6. Footer -- Professional

- Add product links, social links layout
- Subtle gradient separator line

### 7. CSS & Animations (index.css + tailwind.config.ts)

- Add custom keyframes: fade-in, slide-up, float, pulse-glow
- Add animated gradient background utility
- Smoother transition defaults
- Better focus-visible states globally

### 8. 404 Page -- On-brand

- Currently uses hardcoded gray colors, update to use design system tokens
- Add illustration and proper navigation

### Technical Approach
- All animations via CSS keyframes in tailwind config (no extra deps)
- Public personas will join profiles table for names using a modified RLS policy or by storing names in personas table (checking feasibility)
- No new dependencies needed -- pure CSS + existing component library

### Files to modify
- `src/index.css` -- new animations and global styles
- `tailwind.config.ts` -- custom keyframes and animation utilities
- `src/pages/Index.tsx` -- complete landing page redesign
- `src/pages/PublicPersonas.tsx` -- gallery upgrade with names
- `src/pages/Account.tsx` -- dashboard-style layout
- `src/pages/SignIn.tsx` -- split layout, polish
- `src/pages/SignUp.tsx` -- split layout, progress states
- `src/pages/NotFound.tsx` -- on-brand 404
- `src/components/Header.tsx` -- enhanced mobile menu animation
- `src/components/Footer.tsx` -- professional footer

