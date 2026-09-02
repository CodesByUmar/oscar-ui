// src/pages/Categories.tsx
import { Header } from "@/features/header/Header";
import { useProductStore } from "@/store/productStore";
import { useI18nStore } from "@/store/i18nStore";
import { ChevronRight, LayoutGrid, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Categories() {
  const { products, isLoading, error } = useProductStore();
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const navigate = useNavigate();

  const dynamicTopCategories = Array.from(new Set(products.map((p) => p.topCategoryKey))).filter(Boolean);

  const topNameMap: Record<string, string> = {};
  const topImageMap: Record<string, string> = {};
  const topCountMap: Record<string, number> = {};

  products.forEach(product => {
    if (product.topCategoryKey) {
      if (!topNameMap[product.topCategoryKey]) {
        topNameMap[product.topCategoryKey] = product.topCategory;
      }
      if (!topImageMap[product.topCategoryKey] && product.image) {
        topImageMap[product.topCategoryKey] = product.image;
      }
      topCountMap[product.topCategoryKey] = (topCountMap[product.topCategoryKey] || 0) + 1;
    }
  });

  const handleCategoryClick = (topCategoryKey: string) => {
    navigate(`/categories/${encodeURIComponent(topCategoryKey)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-[104px]">
      <Header />
      <main className="container pt-6 max-w-2xl mx-auto px-4">

        <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2">{t('nav.catalog')}</h2>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl p-3 h-[168px] border border-slate-100"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 rounded-3xl p-8 text-center border border-red-100 shadow-sm">
            {t('home.system_error')}: {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* Barcha mahsulotlar */}
            <div
              onClick={() => navigate('/all-products')}
              className="col-span-2 bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-5 shadow-lg cursor-pointer active:scale-[0.98] transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  <LayoutGrid className="w-6 h-6 text-white" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-0.5">{t('home.all')}</h3>
                  <p className="text-sm text-white/80 font-medium">{products.length} {lang === 'uz' ? 'ta mahsulot' : (lang === 'ru' ? 'товаров' : 'products')}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </div>

            {/* Ustki kategoriyalar tarmoq (grid) */}
            {dynamicTopCategories.map((topCategoryKey) => (
              <div
                key={topCategoryKey}
                onClick={() => handleCategoryClick(topCategoryKey)}
                className="bg-white rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all group flex flex-col"
              >
                <div className="aspect-square w-full rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden p-3 mb-2 group-hover:border-primary/30 transition-colors">
                  {topImageMap[topCategoryKey] ? (
                    <img
                      src={topImageMap[topCategoryKey]}
                      alt={topNameMap[topCategoryKey] || topCategoryKey}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight mb-1 min-h-[34px]">
                  {topNameMap[topCategoryKey] || topCategoryKey}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-auto">
                  {topCountMap[topCategoryKey] || 0} {lang === 'uz' ? 'ta mahsulot' : (lang === 'ru' ? 'товаров' : 'products')}
                </p>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
