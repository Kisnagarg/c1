---
name: c1-ecommerce-generator
description: >-
  Complete blueprint, architecture, and generator for the Rathore Electronics (C1)
  e-commerce & electrical services platform. Use this skill whenever you need to build,
  replicate, scaffold, customize, or deploy this full-stack application (1-Tap Google SSO,
  ₹200 UPI Advance Gateway, NPCI Dynamic QR Code, WhatsApp CRM, Admin Operations Panel,
  strict Indian phone validation, and automated PDF proposal generators).
---

# Rathore Electronics (C1) — E-Commerce & Services Platform Skill

This skill contains the complete operational blueprint, code templates, database schemas, and deployment workflows to create, update, or replicate the **Rathore Electronics** e-commerce and repair booking platform anytime.

---

## 1. Platform Overview & Tech Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, Lucide Icons | Responsive desktop & Amazon-style mobile navigation, sub-second loads |
| **Authentication** | Google Identity Services (GIS), JWT | 1-Tap Google SSO (0 passwords), discreet admin credentials login |
| **Backend API** | Node.js, Express.js (Serverless Ready) | High-throughput REST API with MongoDB Mongoose ORM |
| **Database** | MongoDB Cloud Atlas | Encrypted cloud database with automated indexes |
| **Media Storage**| Cloudinary Cloud CDN | Automated webp compression for product images & payment screenshots |
| **Payments** | Direct NPCI UPI Engine | 0% aggregator fees, dynamic QR code (\`8435930113@axl\`), GPay/PhonePe deep links, 12-digit UTR verification |
| **CRM / Messaging**| WhatsApp Click-to-Chat API | 1-Click pre-formatted order confirmation & status updates |
| **Reporting** | Puppeteer Headless Chromium Engine | Executive-quality PDF feature guides & client proposals |
| **Hosting** | Vercel Edge Serverless Network | 99.99% uptime, global SSL encryption & instant CI/CD deployment |

---

## 2. Directory Structure Blueprint

\`\`\`
c1-ecommerce-platform/
├── api/
│   └── index.js                      # Serverless entry point for Vercel backend
├── client/
│   ├── public/
│   │   ├── logo.jpg                  # Store logo
│   │   └── qr.png                    # Backup static QR code
│   ├── src/
│   │   ├── api/axios.js              # Axios instance with auth token interceptor
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── GoogleLoginButton.jsx # 1-Tap Google SSO & Gmail fallback
│   │   │   │   └── PhoneOtpModal.jsx     # Optional Firebase phone OTP modal
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx        # Dual Desktop & Amazon-style mobile navbar
│   │   │   │   └── Footer.jsx        # Modern footer with store contact & maps
│   │   │   └── ui/                   # Button, Card, Input, Modal, Badge, Spinner
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # User auth state, JWT handling & Google SSO
│   │   │   └── SettingsContext.jsx   # Live store branding, phone, and UPI settings
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Hero banner, category highlights, featured products
│   │   │   ├── Categories.jsx        # 8 curated electrical & drone categories
│   │   │   ├── Products.jsx          # Catalog with search, filters & price sorting
│   │   │   ├── ProductDetail.jsx     # Product specs, gallery & 1-click booking
│   │   │   ├── Booking.jsx           # Order checkout & ₹200 advance payment initiation
│   │   │   ├── OrderPayment.jsx      # Dynamic QR code, UPI deep links & UTR upload
│   │   │   ├── Dashboard.jsx         # Customer 5-stage order tracking & profile
│   │   │   ├── Login.jsx             # 1-Tap Google login + Collapsible staff login
│   │   │   ├── Register.jsx          # 1-Click Google signup card (0 passwords)
│   │   │   ├── Contact.jsx           # Store location, helpline, WhatsApp, and Google Maps
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx     # Analytics, bookings, products & store settings
│   │   │       ├── Bookings.jsx      # Order verification, UTR check & WhatsApp CRM
│   │   │       ├── Products.jsx      # Inventory control & Cloudinary image uploads
│   │   │       └── Settings.jsx      # No-code store branding, UPI VPA & contact editor
│   │   └── utils/
│   │       ├── validators.js         # Strict Indian phone & email format validators
│   │       └── initialData.js        # Starter products, 8 categories & default settings
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   │   ├── db.js                     # MongoDB connection with auto-reconnect
│   │   └── ensureSeed.js             # Automated database seeding on cold start
│   ├── controllers/
│   │   ├── authController.js         # Google SSO, JWT generation & profile management
│   │   ├── bookingController.js      # Orders, UTR submissions & status transitions
│   │   ├── productController.js      # Product CRUD & stock management
│   │   └── settingsController.js     # Store configuration & UPI VPA management
│   ├── models/
│   │   ├── User.js                   # Customer & Admin accounts
│   │   ├── Product.js                # Inventory items, MRP, discounts & category
│   │   ├── Booking.js                # Orders, advance payment, UTR, screenshots & status
│   │   └── Settings.js               # Business name, phones, UPI ID, logo & address
│   ├── routes/                       # Express router endpoints
│   ├── seed/seed.js                  # Standalone seeding script
│   └── server.js                     # Local Express server (port 5000)
├── package.json                      # Monorepo root config with build scripts
└── vercel.json                       # Vercel serverless routing & build config
\`\`\`

---

## 3. Core Feature Implementation Blueprints

### A. 1-Tap Google Authentication & Zero-Friction Signup
* **Client ID**: \`1010978833106-r5tb5u4a2eep732ll9nhubld0gtnmihc.apps.googleusercontent.com\`
* **Workflow**:
  1. Load Google Identity Services script in \`index.html\`: \`<script src="https://accounts.google.com/gsi/client" async defer></script>\`.
  2. \`GoogleLoginButton.jsx\` initializes \`google.accounts.id.initialize\` and renders the official button.
  3. When the user taps Google, Google returns an ID token \`credential\`.
  4. Client sends \`{ credential }\` to \`POST /api/auth/google\`.
  5. Server verifies token or decodes JWT payload, creates user with verified email if not exists, and issues a 7-day JWT.
  6. User is immediately logged in with zero password setup.

### B. Strict Indian Mobile Number Validation
* **Pattern**: \`/^[6-9]\\d{9}$/\` (Must start with 6, 7, 8, or 9 and have exactly 10 digits).
* **Dummy / Pattern Blocker**: Rejects repetitive patterns like \`9876543210\`, \`9999999999\`, \`1234567890\`.
* **Collection Strategy**: Phone number is NOT required during registration. It is collected naturally during checkout/booking and saved to the user profile automatically.

### C. ₹200 UPI Advance Payment Gateway
* **NPCI QR Code URI Format**:
  \`\`\`
  upi://pay?pa={UPI_ID}&pn={BUSINESS_NAME}&am={ADVANCE_AMOUNT}&cu=INR&tn=Booking_{BOOKING_ID}
  \`\`\`
  Example: \`upi://pay?pa=8435930113@axl&pn=Rathore%20Electronics&am=200&cu=INR&tn=Booking_66fb1023\`
* **Mobile Deep-Links**:
  * GPay: \`gpay://upi/pay?pa=...\`
  * PhonePe: \`phonepe://pay?pa=...\`
  * Paytm: \`paytmmp://pay?pa=...\`
  * Generic UPI: \`upi://pay?pa=...\`
* **UTR Verification**:
  * Customer inputs 12-digit numeric bank reference (UTR).
  * Optional payment screenshot upload (uploaded to Cloudinary CDN).
  * Booking transitions to \`Pending Verification\`.

### D. 5-Stage Order Pipeline
1. \`Pending Verification\` (⏳ UTR submitted, waiting for store review)
2. \`Confirmed\` (✔ ₹200 verified in merchant bank account, inventory locked)
3. \`Processing / In Repair\` (⚙ Packing goods or servicing drone)
4. \`Out for Delivery\` (🚚 Dispatched with courier or technician)
5. \`Delivered / Completed\` (🎉 Handover complete, remaining balance collected)

### E. Store Admin Operations Panel (\`/admin\`)
* **Access**: Secured via \`role: 'admin'\`. Default demo credentials: \`admin@rathoreelectronics.com\` / \`admin123\`.
* **1-Click Payment Approval**: Store manager matches UTR on bank SMS / app, then clicks "Confirm Payment" to approve order in 1 click.
* **1-Click WhatsApp CRM**:
  \`\`\`javascript
  const message = \`Hello \${customerName}, your booking #\${bookingId} at Rathore Electronics is confirmed! Advance ₹200 received. Remaining balance: ₹\${remainingBalance}. Contact: +91 8435930113.\`;
  window.open(\`https://wa.me/91\${phone}?text=\${encodeURIComponent(message)}\`, '_blank');
  \`\`\`
* **No-Code Store Customization**: Store owner can edit phone numbers, WhatsApp, UPI ID, logo, address, and Instagram handle in \`/admin?tab=settings\`.

---

## 4. Default Seed Data (8 Categories & Initial Store Settings)

### 8 Dedicated Categories:
1. **Drones & Drone Repair Services** (Slug: \`drones\`)
2. **LED Bulbs & Tube Lights** (Slug: \`bulbs-tubes\`)
3. **Heavy Wires & Flexible Cables** (Slug: \`wires-cables\`)
4. **Fast Mobile Chargers & Adapters** (Slug: \`chargers\`)
5. **RC Toys & High-Speed Monster Trucks** (Slug: \`rc-toys\`)
6. **Mixers & Kitchen Appliances** (Slug: \`mixers-kitchen-appliances\`)
7. **Kids Electric Toys** (Slug: \`toys-monster-trucks\`)
8. **Other Electrical Essentials** (Slug: \`others\`)

### Default Store Settings:
* **Business Name**: Rathore Electronics
* **Owner / Proprietor**: Mahendra Rathore
* **Primary Helpline**: \`8435930113\`
* **Secondary Helpline**: \`7067586087\`
* **WhatsApp Number**: \`8435930113\`
* **Instagram**: \`@rathore_electronics_\` (\`https://www.instagram.com/rathore_electronics_/\`)
* **Merchant UPI VPA**: \`8435930113@axl\`
* **Advance Booking Amount**: \`200\`
* **Store Address**: Main Bus Stand, Atari Khejda, Vidisha (Madhya Pradesh)

---

## 5. Environment Variables Configuration (\`.env\`)

### Client (\`client/.env\`):
\`\`\`env
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=1010978833106-r5tb5u4a2eep732ll9nhubld0gtnmihc.apps.googleusercontent.com
VITE_FIREBASE_API_KEY=AIzaSyCh3VbmPBBTnd-dMZkxmzRu6yDj3y7Yjxc
VITE_FIREBASE_AUTH_DOMAIN=c1elec.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=c1elec
VITE_FIREBASE_STORAGE_BUCKET=c1elec.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1010978833106
VITE_FIREBASE_APP_ID=1:1010978833106:web:e4e78e636e72f4b21ee30b
\`\`\`

### Server (\`server/.env\`):
\`\`\`env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://rathore_admin:secure_password@cluster0.mongodb.net/rathore_electronics?retryWrites=true&w=majority
JWT_SECRET=rathore_jwt_secret_key_2024_secure
CLOUDINARY_CLOUD_NAME=rathore_electronics
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
\`\`\`

---

## 6. Commands Runbook

### Local Development:
\`\`\`bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Seed database with initial products and admin account
npm run seed

# 3. Start local servers
cd server && npm run dev     # Starts backend on http://localhost:5000
cd client && npm run dev     # Starts frontend on http://localhost:5173
\`\`\`

### Production Build & Deploy to Vercel:
\`\`\`bash
# 1. Test build
cd client && npm run build

# 2. Deploy directly to Vercel Production
vercel --prod --yes
\`\`\`
