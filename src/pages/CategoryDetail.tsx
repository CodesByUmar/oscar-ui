// src/pages/CategoryDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "@/store/productStore";
import { ProductCard } from "@/features/products/ProductCard";
import { useI18nStore } from "@/store/i18nStore";
import { ChevronLeft, Search, X } from "lucide-react";
import { useState } from "react";

export function CategoryDetail() {
    const { categoryKey } = useParams<{ categoryKey: string }>();
    const navigate = useNavigate();
    const { products, isLoading } = useProductStore();
    const t = useI18nStore((s) => s.t);
    const lang = useI18nStore((s) => s.lang);
    const [searchQuery, setSearchQuery] = useState("");

    const categoryProducts = products.filter(p => p.categoryKey === categoryKey);
    const categoryName = categoryProducts[0]?.category || categoryKey || '';

    const filteredProducts = categoryProducts.filter((p) => {
        if (searchQuery.trim() === "") return true;
        const name = (p.nameI18n?.[lang] || p.name).toLowerCase();
        const desc = (p.descriptionI18n?.[lang] || p.description || "").toLowerCase();
        return name.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-[104px]">
            <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"
                        >
                            <ChevronLeft className="w-6 h-6 text-slate-700" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-slate-900 truncate">{categoryName}</h1>
                            <p className="text-sm text-slate-500 font-medium">
                                {filteredProducts.length} {lang === 'uz' ? 'ta mahsulot' : (lang === 'ru' ? 'товаров' : 'products')}
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('home.search') || "Qidirish..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-600" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <main className="container max-w-2xl mx-auto px-4 pt-6">
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-8 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-3 pb-14 shadow-sm border border-slate-50 h-48 w-full">
                                <div className="bg-slate-100 rounded-2xl w-full h-24 mb-4"></div>
                                <div className="h-3 bg-slate-100 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-8">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">
                            {searchQuery ? "Hech narsa topilmadi" : t('product.not_found')}
                        </h3>
                        <p className="text-slate-500 text-sm">
                            {searchQuery
                                ? `"${searchQuery}" bo'yicha mahsulot yo'q`
                                : t('home.no_products')}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}