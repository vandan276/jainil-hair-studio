# Eminence Salon Vadodara — PRD

## Original Problem
Create a salon website named **Eminence** based in Vadodara with e-commerce, admin panel, and user panel.

## Architecture
- **Backend**: FastAPI + Motor (MongoDB) — `/app/backend/server.py`
- **Frontend**: React + Tailwind — light theme inspired by Gemeria Hair (black/white/beige, serif+sans)
- **Auth**: JWT (Bearer in localStorage), bcrypt, role-based (user / admin)

## User Personas
1. **Salon Customer** — Indian woman in Vadodara looking to book services or buy beauty products
2. **Walk-in Browser** — researching services/prices before visiting
3. **Admin / Salon Owner** — manages catalog, bookings, orders

## Implemented (as of 2026-04-25)
- ✅ Backend: auth, services CRUD (admin), products CRUD (admin), stylists, bookings, orders (COD), admin stats + management
- ✅ Seed data: 8 services, 10 products, 5 stylists, admin + demo user
- ✅ Frontend pages: Landing, Services, Book, Shop, ProductDetail, Cart, Checkout, Login, Register, Dashboard (user), Admin
- ✅ Light cream theme with Fraunces (serif) + Manrope (sans)
- ✅ Indian-customer touches: phone CTA, "8,000+ Barodians" trust line, COD emphasis, Hours block
- ✅ **Gemeria-inspired UI redesign**:
  - Announcement bar (marquee) at top
  - Transparent navbar over hero, solid white on scroll/non-hero pages
  - Full-screen hero with dark salon image + dark overlay + centered serif h1
  - Categories grid (Hair, Skin, Bridal, Spa)
  - 4-col product grid with quick-buy hover overlay
  - Black "Why Eminence" editorial split section
  - Trust badges row + testimonial

## Test Credentials
- Admin: `admin@eminence.com` / `Admin@123`
- Demo: `demo@eminence.com` / `Demo@123`

## Backlog (P1)
- Razorpay/Stripe integration for online payment
- Stylist profile pages with portfolio
- Reviews/ratings on services and products
- Admin booking calendar view (slot conflicts)
- WhatsApp chat widget
- Hindi/Gujarati language toggle
- Image upload for admin (currently using URL strings)

## Backlog (P2)
- Loyalty/rewards program
- Gift cards
- SMS booking confirmations (Twilio)
- Email order receipts (Resend/SendGrid)
- Blog / Hair-care tips
