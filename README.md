# 🥗 HappyTummy — Exact Clone of leafli.in

An exact, 1:1 pixel-perfect and byte-complete clone of the **[Leafli](https://leafli.in)** healthy salad and meal bowl delivery service in Vadodara, Gujarat.

Replicated down to the last dots, dashes, t's, and i's in an offline-ready, self-contained architecture ready to launch immediately.

---

## 🚀 Quick Start

Run the application locally in one command:

```bash
# Navigate to the project directory
cd ~/Desktop/HappyTummy

# Start the server (runs on http://localhost:3000)
npm start
```

Or for development:

```bash
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌟 Replicated Features & Pages

### 1. Complete Page & Route Coverage (53 Routes Replicated)
- **Homepage (`/`)**:
  - Live hero section with rotating interactive salad cutouts and delivery badge.
  - Complete "How It Works" 3-step ordering guide.
  - Chef preparation, kitchen hygiene, and cold-chain delivery guarantees.
  - Interactive testimonials and customer review showcase.
  - Sticky navigation header with mobile drawer, cart count badge, and quick order button.
  - Mobile bottom navigation tab bar (`Home`, `Menu`, `Plans`, `Cart`).
- **Menu (`/menu`)**:
  - All 8 signature chef-crafted salads and dessert bowls with category filtering (`Protein Salads`, `Exotic & Classic`, `Desi Greens`, `Fruit & Dessert Bowls`).
  - Nutritional macro badges (Protein, Calories, Diet tags: Veg, Non-Veg, Egg).
  - Interactive item detail modals with complete ingredient lists and allergen warnings.
- **Individual Dish Pages (`/menu/[slug]`)**:
  - `/menu/classic-chicken-caesar-salad`
  - `/menu/asian-noodle-salad`
  - `/menu/desi-mango-sprout-salad`
  - `/menu/salad-caprese`
  - `/menu/greek-hummus-salad`
  - `/menu/roasted-potato-apple-salad`
  - `/menu/roasted-potato-apple-salad-eggless`
  - `/menu/dark-chocolate-fruit-bowl`
- **Subscription Plans (`/plans` & `/plans/[slug]`)**:
  - `/plans/taster-week` (5 days trial plan)
  - `/plans/fortnight-fresh` (10 days habit builder)
  - `/plans/monthly-green` (20 days lifestyle transformation)
  - `/plans/protein-pro` (High-protein athlete plan)
  - Custom meal toggles, diet preferences, delivery slot scheduling.
- **Vadodara SEO Landing Page (`/healthy-food-vadodara`)**:
  - Comprehensive guide covering delivery across Akota, Alkapuri, Vasna-Bhayli, Race Course, Karelibaug, Sayajigunj, Subhanpura, Waghodia Road.
- **Informational & Policy Pages**:
  - `/about` — The story of Leafli, sourcing from local farms, fresh daily batches.
  - `/faq` — Expandable accordion answering common questions about storage, dressings, subscriptions, cancellation.
  - `/contact` — Contact channels, kitchen address (`11 B FF, Pratham Avenue, Akota, Vadodara`), WhatsApp hotline.
  - `/terms` — Terms of Service.
  - `/privacy` — Privacy Policy.
  - `/refunds` — Refund and cancellation policies.
  - `/delivery-policy` — Delivery radius, slots (11 am – 8 pm), cold packaging.
- **Account, Cart & Admin**:
  - `/cart` & Sliding `CartDrawer` with live quantity toggles, subtotal calculation, delivery slot selection.
  - `/checkout` — Streamlined order placement.
  - `/account` & `/orders` — Customer dashboard.
  - `/login` — OTP / Phone authentication flow.
  - `/admin` — Kitchen management portal.
- **Blog Section (`/blog`, `/blog/[slug]`, Categories & Pagination)**:
  - All 18 authentic articles on healthy eating in Vadodara, nutrition tips, office lunch guides, Gujarati food swaps, and fruit bowls.
  - Category filters: `Vadodara Guides`, `From Our Kitchen`, `Healthy Eating`, `Nutrition`.
  - Pagination (`/blog/page/2`).

---

## ⚡ Architecture & Technology

- **Frontend Hydration**: Next.js App Router client bundles with React hydration and GSAP animation triggers.
- **React Server Components (RSC)**: Full RSC flight stream support (`?_rsc=1` and `RSC: 1` header) enabling instant client-side route transitions without page reloads.
- **Self-Contained Local Assets**:
  - All 21 high-resolution food images (cutouts, photos, and OpenGraph cards) stored locally in `/public/menu/`.
  - All typography web fonts (`.woff2`) stored in `/public/_next/static/media/`.
  - Brand wordmark logos (`leafli-wordmark.png`, `leafli-wordmark-light.png`).
  - Web App Manifest (`manifest.webmanifest`) and icons (`icon.png`, `apple-touch-icon.png`).
  - Tailwind CSS compiled stylesheet (`caf7f6b6b6240e00.css`, `70d20930ad8caf97.css`).
- **Full Backend API Suite**:
  - `GET /api/public/menu`: Serves live menu items, pricing, ordering hours (`11:00` - `20:00`), GST rate, and accepting orders status.
  - `GET /api/reviews`: Returns verified customer reviews.
  - `POST /api/reviews`: Validates and records new user ratings.
  - `POST /api/orders`: Handles cart order placements, generates order numbers, and routes to confirmation.
  - `POST /api/subscriptions`: Handles plan subscription enrollments.
  - `POST /api/payments/razorpay/verify`: Validates payment signatures.
  - `GET & POST /api/auth/bootstrap`: Initializes user session.
  - `POST /api/push/subscribe`: Registers web push notification tokens.

---

## 📂 Project Directory Structure

```
HappyTummy/
├── server.js               # Production HTTP server with RSC & API dispatcher
├── package.json            # Node.js configuration & scripts
├── data/
│   ├── menu.json           # Live menu items, nutrition, and pricing
│   └── routes.json         # Full 53-route map linking URLs to HTML & RSC
├── pages/
│   ├── html/               # 53 pre-rendered HTML files
│   └── rsc/                # 53 React Server Component flight streams
└── public/
    ├── brand/              # Brand wordmarks (light and dark)
    ├── icons/              # Apple touch icons & app icons
    ├── menu/               # All 21 salad cutouts, dish photos, and OG cards
    ├── _next/static/
    │   ├── chunks/         # All 34 Next.js client JavaScript bundles
    │   ├── css/            # Production Tailwind CSS stylesheets
    │   ├── media/          # Web typography fonts (.woff2)
    │   └── CJZWBJWXS687Vqr_e_wAa/  # Build & SSG manifests
    ├── favicon.ico         # App favicon
    ├── icon.png            # App icon
    ├── manifest.webmanifest# Progressive Web App (PWA) manifest
    ├── robots.txt          # SEO robots file
    └── sitemap.xml         # XML sitemap with all routes and images
```

---

## 🚢 Production Deployment

### Option 1: PM2 / Node.js Host
```bash
npm install -g pm2
pm2 start server.js --name happytummy
pm2 save
```

### Option 2: Docker
Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```
Build and run:
```bash
docker build -t happytummy .
docker run -p 3000:3000 happytummy
```

---

## 📄 License
This project is an educational and developmental clone built for local testing and launch.
