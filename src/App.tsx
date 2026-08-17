// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { ProductDetail } from "@/pages/ProductDetail";
import { Cart } from "@/pages/Cart";
import { Categories } from "@/pages/Categories";
import { LocationPage } from "@/pages/Location";
import { BottomNav } from "@/components/shared/BottomNav";
import { useProductStore } from "@/store/productStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import Checkout from "./pages/Checkout";
import { SignIn } from "./features/auth/SignIn";
import { CategoryDetail } from "@/pages/CategoryDetail";

function App() {
  const fetchProducts = useProductStore(state => state.fetchProducts);
  const listenNotifications = useNotificationStore(state => state.listenNotifications);
  const fetchUsdRate = useSettingsStore((s) => s.fetchUsdRate);
  const [isReady, setIsReady] = useState(false);
  useEffect(() => { fetchUsdRate(); }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    // Telegram chatId olish
    let telegramChatId: number | null = null;
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user?.id) {
        telegramChatId = tg.initDataUnsafe.user.id;
      }
    } catch (e) { }

    const unsubscribe = listenNotifications(telegramChatId);
    return () => unsubscribe();
  }, [listenNotifications]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="w-full">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:categoryKey" element={<CategoryDetail />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/location" element={<LocationPage />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;