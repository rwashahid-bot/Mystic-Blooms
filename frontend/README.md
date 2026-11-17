# Mystic Blooms — Frontend

React (Vite) frontend for the Mystic Blooms MERN e-commerce site: customer storefront + admin panel.

The site runs **without a backend** for now: all data (products, orders, settings, CMS) is kept in a mock database in the browser's localStorage. When the Express + MongoDB backend is ready, set `VITE_API_URL` and every service switches to real API calls. No page code has to change.

## Run locally

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
```

### Demo logins (mock mode only)

| Role     | Email                  | Password  |
|----------|------------------------|-----------|
| Owner    | admin@mysticblooms.pk  | admin123  |
| Staff    | staff@mysticblooms.pk  | staff123  |
| Customer | ayesha@example.com     | password  |

Admin panel: `/admin`. Guest order tracking: `/track-order` (e.g. `MB-10003` + `03451234567`).
To reset the demo data, go to Admin → Settings → Reset demo data.

## Folder structure

```
src/
├── main.jsx, App.jsx          # entry + all routes
├── styles/global.css          # design tokens + shared utility classes
├── components/                # reusable UI: one folder per component (Component.jsx + Component.css)
│   ├── Navbar/  Footer/  Hero/  ProductCard/  ProductBrowser/  OrderInfo/  Modal/ ...
│   └── admin/                 # admin-only components (Sidebar, Topbar, StatCard, BarChart, Invoice, ImageUploader...)
├── layouts/                   # MainLayout, AccountLayout, AdminLayout (each with its own CSS)
├── pages/                     # one folder per page (Page.jsx + Page.css)
│   ├── Home/ Shop/ Category/ ProductDetails/ Cart/ Checkout/ OrderConfirmation/ TrackOrder/
│   ├── About/ Contact/ FAQ/ Policy/ CustomOrder/ Login/ Register/ ForgotPassword/ NotFound/
│   ├── Account/               # Profile, Addresses, MyOrders, MyOrderDetails
│   └── admin/                 # Dashboard, Orders, OrderDetail, Products, ProductForm, Categories,
│                              # Inventory, Customers, Reviews, Coupons, Enquiries, ContentManager,
│                              # Reports, Notifications, Staff, Settings, AuditLog, AdminLogin
├── context/                   # StoreContext (settings/CMS/categories), AuthContext, CartContext
├── services/                  # API layer: http.js (axios) + one service per domain + mockDb.js
├── hooks/                     # useAsync, usePageTitle, useAdminAlerts
├── routes/guards.jsx          # ProtectedRoute, AdminRoute (role + permission), ScrollToTop
├── utils/                     # pricing, dates (lead-time rules), validators, analytics, CSV export
└── data/seedData.js           # sample data used by the mock DB
```

## Connecting the backend

1. Copy `.env.example` to `.env` and set `VITE_API_URL=https://your-api.vercel.app`.
2. The frontend calls `${VITE_API_URL}/api/...` with `Authorization: Bearer <token>`.
3. Endpoints expected by the services (see `src/services/*.js`):

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/admin/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/forgot-password` |
| Me | `PUT /users/me`, `PUT /users/me/password`, `POST/PUT/DELETE /users/me/addresses/:id` |
| Catalogue | `GET /products`, `GET /products/slug/:slug`, `GET /products/:id`, `GET /products/filters`, `GET /categories`, `GET /categories/:slug` |
| Orders | `POST /orders`, `POST /orders/track`, `GET /orders/mine`, `GET /orders/mine/:id`, `GET /orders/capacity` |
| Public | `GET /settings`, `GET /cms`, `POST /coupons/validate`, `POST /enquiries`, `GET/POST /products/:id/reviews` |
| Admin | `/admin/products`, `/admin/categories`, `/admin/orders` (+ `/status`, `/payment`, `/notes`, `/courier`), `/admin/coupons`, `/admin/reviews`, `/admin/enquiries`, `/admin/customers`, `/admin/staff`, `/admin/settings`, `/admin/cms` (+ `/draft`, `/publish`), `/admin/inventory/log`, `/admin/audit-log` |

**Important server rules:** re-price the cart and validate lead time, capacity and stock on the server (the logic in `orderService.js` mock shows exactly what to do). Store product/option/price **snapshots** in each order, keep payment status separate from order status, and never store card data.

## Deploy to Vercel

- New Project → import the repo → **Root Directory: `frontend`**
- Framework preset: Vite (build `npm run build`, output `dist`)
- Environment variable: `VITE_API_URL` (once the backend is deployed)
- `vercel.json` already rewrites all routes to `index.html` so React Router deep links work.

## Placeholders to confirm with the owner

WhatsApp/phone/email, bank/Easypaisa/JazzCash details, delivery fees per city, prices, categories, and the policy text are all **sample values**. Update them from Admin → Settings and Admin → Website CMS.
