// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";
import { Header } from "@/features/header/Header";
import { BannerCarousel } from "@/features/products/BannerCarousel";
import { DiscountCarousel } from "@/features/products/DiscountCarousel";
import { FeaturedCarousel } from "@/features/products/FeaturedCarousel";
import { useProductStore } from "@/store/productStore";
import { useI18nStore } from "@/store/i18nStore";
import { useAuth } from "@/context/AuthContext";
import { LayoutGrid, ChevronRight } from "lucide-react";

export function Home() {
  const navigate = useNavigate();
  const { products } = useProductStore();
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);

  const { user } = useAuth();
  const isVip = user?.isVip || false;
  const isTelegram = !!(window as any).Telegram?.WebApp;

  return (
    <div className="min-h-screen pb-[104px] bg-slate-50 w-full">
      <Header />

      {isTelegram && isVip && (
        <div className="container max-w-2xl mx-auto px-4 pt-2">
          <button
            className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-2xl border border-vip/40 flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.99] transition-all"
            onClick={() => alert("VIP sahifasi")}
          >
            <span className="text-vip text-base leading-none">★</span>
            <span className="text-sm tracking-wide">VIP KIRISH</span>
          </button>
        </div>
      )}

      <main className="container pt-3 md:pt-5 max-w-2xl mx-auto pb-6">

        <section className="mb-4">
          <BannerCarousel />
        </section>

        <section className="mb-4">
          <DiscountCarousel />
        </section>

        <section className="mb-8">
          <FeaturedCarousel />
        </section>

        <section className="px-4">
          <button
            onClick={() => navigate('/all-products')}
            className="w-full bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-5 shadow-lg cursor-pointer active:scale-[0.98] transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <LayoutGrid className="w-6 h-6 text-white" strokeWidth={1.75} />
              </div>
              <div className="text-left">
                <h3 className="text-base font-bold text-white mb-0.5">{t('home.all_products')}</h3>
                <p className="text-sm text-white/80 font-medium">
                  {products.length} {lang === 'uz' ? 'ta mahsulot' : (lang === 'ru' ? 'товаров' : 'products')}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>
        </section>
      </main>

    </div>
  );
}
