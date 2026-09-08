// src/pages/AllProducts.tsx
import { useNavigate } from "react-router-dom";
import { useProductStore } from "@/store/productStore";
import { ProductCard } from "@/features/products/ProductCard";
import { useI18nStore } from "@/store/i18nStore";
import { ChevronLeft, Search, X } from "lucide-react";
import { useState } from "react";
import { cyrillicToLatinUz, isCyrillic } from "@/lib/transliterate";

export function AllProducts() {
    const navigate = useNavigate();
    const { products, isLoading } = useProductStore();
    const t = useI18nStore((s) => s.t);
    const lang = useI18nStore((s) => s.lang);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTopCategory, setSelectedTopCategory] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const trimmedQuery = searchQuery.trim();
    const queryVariants = [trimmedQuery.toLowerCase()];
    if (isCyrillic(trimmedQuery)) {
        queryVariants.push(cyrillicToLatinUz(trimmedQuery).toLowerCase());
    }

    // Top-kategoriya tugmalari — mavjud mahsulotlardan dinamik yig'iladi,
    // ko'rsatiladigan nom (topCategory) birinchi uchragan mahsulotdan olinadi.
    const topCategoryNameMap: Record<string, string> = {};
    products.forEach((p) => {
        if (p.topCategoryKey && !topCategoryNameMap[p.topCategoryKey]) {
            topCategoryNameMap[p.topCategoryKey] = p.topCategory;
        }
    });
    const topCategoryKeys = Array.from(new Set(products.map((p) => p.topCategoryKey))).filter(Boolean);

    // Sub-kategoriya tugmalari — faqat tanlangan top-kategoriya ichidagilar.
    const productsInTopCategory = selectedTopCategory
        ? products.filter((p) => p.topCategoryKey === selectedTopCategory)
        : [];
    const subCategoryNameMap: Record<string, string> = {};
    productsInTopCategory.forEach((p) => {
        if (p.categoryKey && !subCategoryNameMap[p.categoryKey]) {
            subCategoryNameMap[p.categoryKey] = p.category;
        }
    });
    const subCategoryKeys = Array.from(new Set(productsInTopCategory.map((p) => p.categoryKey))).filter(Boolean);

    const handleSelectTopCategory = (key: string | null) => {
        setSelectedTopCategory(key);
        setSelectedCategory(null); // top-kategoriya almashsa, sub-tanlov ham tozalanadi
    };

    const filteredProducts = products.filter((p) => {
        if (selectedTopCategory && p.topCategoryKey !== selectedTopCategory) return false;
        if (selectedCategory && p.categoryKey !== selectedCategory) return false;
        if (trimmedQuery === "") return true;
        const fields = [p.name, p.nameI18n?.uz, p.nameI18n?.ru, p.nameI18n?.en, p.description, p.descriptionI18n?.uz]
            .filter(Boolean)
            .map((f) => f!.toLowerCase());
        return queryVariants.some((q) => fields.some((f) => f.includes(q)));
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
                            <h1 className="text-xl font-bold text-slate-900 truncate">{t('home.all_products')}</h1>
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

                    {topCategoryKeys.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            <button
                                onClick={() => handleSelectTopCategory(null)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                                    selectedTopCategory === null
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {t('home.all')}
                            </button>
                            {topCategoryKeys.map((key) => (
                                <button
                                    key={key}
                                    onClick={() => handleSelectTopCategory(key)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 whitespace-nowrap ${
                                        selectedTopCategory === key
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {topCategoryNameMap[key] || key}
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedTopCategory && subCategoryKeys.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                                    selectedCategory === null
                                        ? "bg-primary/10 text-primary border-primary/30"
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                {t('home.all')}
                            </button>
                            {subCategoryKeys.map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 whitespace-nowrap ${
                                        selectedCategory === key
                                            ? "bg-primary/10 text-primary border-primary/30"
                                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    {subCategoryNameMap[key] || key}
                                </button>
                            ))}
                        </div>
                    )}
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
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                            <Search className="w-6 h-6 text-slate-400" strokeWidth={1.75} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Hech narsa topilmadi</h3>
                        <p className="text-slate-500 text-sm">
                            "{searchQuery}" bo'yicha mahsulot yo'q
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
