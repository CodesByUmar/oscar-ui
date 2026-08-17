# 🛍️ OSCAR — Mini-App (oscar-ui)

Telegram Mini-App sifatida ishlaydigan onlayn do'kon interfeysi. **OSCAR** tizimining uchta repozitoriyasidan biri — mijozlar mahsulotlarni ko'rish, savatga qo'shish va buyurtma berish uchun shu ilovadan foydalanadi.

> 🔗 Bog'liq repolar: [`oscar-admin-bot`](https://github.com/Oyatillo-tech/oscar-admin-bot) (boshqaruv paneli) · [`oscar-shop-bot`](https://github.com/Oyatillo-tech/oscar-shop-bot) (mijoz boti)

## 🚀 Texnologiyalar

React + TypeScript + Vite, Zustand, Tailwind CSS, Firebase JS SDK, @react-google-maps/api

## ✨ Asosiy imkoniyatlar

- 🗂️ Mahsulotlar katalogi — kategoriyalar, karusellar (top/chegirmali mahsulotlar)
- 🛒 To'liq funksional savat (Zustand orqali global holatda saqlanadi)
- 📍 Checkout sahifasida Google Maps orqali yetkazib berish manzilini tanlash
- 🔥 Firebase Firestore bilan real-vaqtli ma'lumotlar sinxronizatsiyasi (`onSnapshot`)
- 💳 Payme to'lov tizimi integratsiyasi
- 📱 Telegram Web App sifatida to'liq moslashgan interfeys

## 📁 Loyiha strukturasi

```
src/
├── main.tsx, App.tsx          # Kirish nuqtasi va routing
├── lib/firebase.ts            # Firebase SDK konfiguratsiyasi
├── pages/
│   ├── Home.tsx                # Bosh sahifa
│   ├── Categories.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx            # Yetkazib berish + to'lov (eng murakkab sahifa)
│   └── Profile.tsx
├── features/
│   ├── products/DiscountCarousel.tsx
│   ├── products/FeaturedCarousel.tsx
│   └── categories/CategoryCarousel.tsx
├── store/                      # Zustand: savat, til, sozlamalar
└── utils/discount.ts
```

## 🛠️ O'rnatish

```bash
git clone https://github.com/Oyatillo-tech/oscar-ui.git
cd oscar-ui
npm install
```

## ⚙️ Muhit o'zgaruvchilari (.env)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_MAPS_API_KEY=
VITE_PAYME_MERCHANT_ID=
```

> ⚠️ Bu qiymatlar hech qachon ochiq repoga qo'yilmasligi kerak.

## ▶️ Ishga tushirish

```bash
npm run dev      # lokal test
npm run build     # production build
```

## 👤 Muallif

**Oyatillo Obloberdiev**
[LinkedIn](https://www.linkedin.com/in/oyatillo-obloberdiev-14b645294/) | [GitHub](https://github.com/Oyatillo-tech)
