// src/pages/SubcategoryList.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "@/store/productStore";
import { useI18nStore } from "@/store/i18nStore";
import { ChevronLeft, Package } from "lucide-react";

export function SubcategoryList() {
    const { topCategory: rawTopCategory } = useParams<{ topCategory: string }>();
    const topCategoryKey = rawTopCategory ? decodeURIComponent(rawTopCategory) : rawTopCategory;
    const navigate = useNavigate();
    const { products, isLoading } = useProductStore();
    const t = useI18nStore((s) => s.t);
    const lang = useI18nStore((s) => s.lang);

    const topProducts = products.filter(p => p.topCategoryKey === topCategoryKey);
    // Barcha mos mahsulotlar bir xil topCategoryKey'ga ega, shuning uchun
    // ko'rsatiladigan (tanlangan tilga tarjima qilingan) nomni ulardan
    // birinchisidan olamiz — topilmasa xom kalitning o'zi ko'rsatiladi.
    const topCategoryName = topProducts[0]?.topCategory || topCategoryKey || '';

    const dynamicSubcategories = Array.from(new Set(topProducts.map((p) => p.categoryKey))).filter(Boolean);

    const subDisplayMap: Record<string, string> = {};
    const subImageMap: Record<string, string> = {};
    const subCountMap: Record<string, number> = {};

    topProducts.forEach(product => {
        if (product.categoryKey) {
            if (!subDisplayMap[product.categoryKey]) {
                subDisplayMap[product.categoryKey] = product.category;
            }
            if (!subImageMap[product.categoryKey] && product.image) {
                subImageMap[product.categoryKey] = product.image;
            }
            subCountMap[product.categoryKey] = (subCountMap[product.categoryKey] || 0) + 1;
        }
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-[104px]">
            <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"
                        >
                            <ChevronLeft className="w-6 h-6 text-slate-700" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-slate-900 truncate">{topCategoryName}</h1>
                            <p className="text-sm text-slate-500 font-medium">
                                {topProducts.length} {lang === 'uz' ? 'ta mahsulot' : (lang === 'ru' ? 'товаров' : 'products')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container max-w-2xl mx-auto px-4 pt-6">
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-3 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-3 h-[168px] border border-slate-100"></div>
                        ))}
                    </div>
                ) : dynamicSubcategories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {dynamicSubcategories.map((catKey) => (
                            <div
                                key={catKey}
                                onClick={() => navigate(`/category/${encodeURIComponent(catKey)}`)}
                                className="bg-white rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all group flex flex-col"
                            >
                                <div className="aspect-square w-full rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden p-3 mb-2 group-hover:border-primary/30 transition-colors">
                                    {subImageMap[catKey] ? (
                                        <img
                                            src={subImageMap[catKey]}
                                            alt={catKey}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <Package className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                                    )}
                                </div>
                                <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight mb-1 min-h-[34px]">
                                    {subDisplayMap[catKey] || catKey}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-auto">
                                    {subCountMap[catKey] || 0} {lang === 'uz' ? 'ta mahsulot' : (lang === 'ru' ? 'товаров' : 'products')}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-400" strokeWidth={1.75} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{t('product.not_found')}</h3>
                        <p className="text-slate-500 text-sm">{t('home.no_products')}</p>
                    </div>
                )}
            </main>
        </div>
    );
}
