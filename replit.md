# fastfits - T-Shirt Sale Website

## Overview
A premium t-shirt e-commerce website targeting college students. Features a beautiful, responsive design with dark/light mode, product catalog with filtering and search, shopping cart, and checkout flow.

## Tech Stack
- **Frontend**: React + TypeScript + Vite, TailwindCSS, Shadcn UI, Framer Motion, TanStack Query, Wouter
- **Backend**: Express.js with session management
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Plus Jakarta Sans (sans), Playfair Display (serif), blue primary color theme (#62a4fa / HSL 214 94% 68%)

## Project Structure
- `client/src/pages/` - Page components (home, shop, product-detail, checkout)
- `client/src/components/` - Shared components (navbar, product-card, cart-drawer)
- `client/src/lib/` - Context providers (cart, theme), query client
- `server/` - Express backend with routes, storage, database, seed data
- `shared/schema.ts` - Drizzle schema + Zod validation types
- `client/public/images/` - Product images and hero image

## Key Features
- Landing page with hero section, featured products, new arrivals, sale items
- Product catalog with category filtering, search, and sorting
- Product detail with size/color selection and add to cart
- Shopping cart drawer with quantity management
- Checkout with form validation (useForm + zodResolver)
- Dark/light mode toggle
- Session-based cart persistence
- Responsive design for all screen sizes

## Database Tables
- `products` - T-shirt products with categories, sizes, colors, pricing
- `cart_items` - Shopping cart items linked to sessions
- `orders` - Customer orders
- `order_items` - Individual items within orders

## API Routes
- `GET /api/products` - List products (supports category, limit, badge, has_sale filters)
- `GET /api/products/:id` - Get single product
- `GET /api/cart` - Get session cart items
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove cart item
- `POST /api/orders` - Place order (validates name + email with Zod)

## Recent Changes
- 2026-02-19: Initial MVP built with full e-commerce flow
