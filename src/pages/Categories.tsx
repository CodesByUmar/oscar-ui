// src/pages/Categories.tsx
import { Header } from "@/features/header/Header";
import { useProductStore } from "@/store/productStore";
import { useI18nStore } from "@/store/i18nStore";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Categories() {
  const { products, isLoading, error } = useProductStore();
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const navigate = useNavigate();

  const dynamicCategories = Array.from(new Set(products.map((p) => p.categoryKey))).filter(Boolean);

  const categoryDisplayMap: Record<string, string> = {};
  const categoryImageMap: Record<string, string> = {};
  const categoryCountMap: Record<string, number> = {};

  products.forEach(product => {
    if (product.categoryKey) {
      if (!categoryDisplayMap[product.categoryKey]) {
        categoryDisplayMap[product.categoryKey] = product.category;
      }
      if (!categoryImageMap[product.categoryKey] && product.image) {
        categoryImageMap[product.categoryKey] = product.image;
      }
      categoryCountMap[product.categoryKey] = (categoryCountMap[product.categoryKey] || 0) + 1;
    }
  });

  const handleCategoryClick = (catKey: string) => {
    navigate(`/category/${catKey}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-[104px]">
      <Header />
      <main className="container pt-6 max-w-2xl mx-auto px-4">

        <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2">{t('nav.catalog')}</h2>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 h-24 border border-slate-100"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 rounded-3xl p-8 text-center border border-red-100 shadow-sm">
            {t('home.system_error')}: {error}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Barcha mahsulotlar */}
            <div
              onClick={() => navigate('/all-products')}
              className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 shadow-lg cursor-pointer active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🌍
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{t('home.all')}</h3>
                    <p className="text-sm text-white/80 font-medium">{products.length} {lang === 'uz' ? 'ta mahsulot' : (lang === 'ru' ? 'товаров' : 'products')}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white/80 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Kategoriyalar ro'yxati */}
            {dynamicCategories.map((catKey) => (
              <div
                key={catKey}
                onClick={() => handleCategoryClick(catKey)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                      {categoryImageMap[catKey] ? (
                        <img
                          src={categoryImageMap[catKey]}
                          alt={catKey}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">📁</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 mb-1 truncate">
                        {categoryDisplayMap[catKey] || catKey}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {categoryCountMap[catKey] || 0} {lang === 'uz' ? 'ta mahsulot' : (lang === 'ru' ? 'товаров' : 'products')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}