// src/pages/AllProducts.tsx
import { useNavigate } from "react-router-dom";
import { useProductStore } from "@/store/productStore";
import { ProductCard } from "@/features/products/ProductCard";
import { useI18nStore } from "@/store/i18nStore";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
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
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sheetLevel, setSheetLevel] = useState<'top' | 'sub'>('top');

    const trimmedQuery = searchQuery.trim();
    const queryVariants = [trimmedQuery.toLowerCase()];
    if (isCyrillic(trimmedQuery)) {
        queryVariants.push(cyrillicToLatinUz(trimmedQuery).toLowerCase());
    }

    const countLabel = (n: number) => `${n} ${lang === 'uz' ? 'ta mahsulot' : (lang === 'ru' ? 'товаров' : 'products')}`;

    // Top-kategoriya ro'yxati — mavjud mahsulotlardan dinamik yig'iladi,
    // ko'rsatiladigan nom (topCategory) birinchi uchragan mahsulotdan olinadi.
    const topCategoryNameMap: Record<string, string> = {};
    const topCategoryCountMap: Record<string, number> = {};
    products.forEach((p) => {
        if (p.topCategoryKey) {
            if (!topCategoryNameMap[p.topCategoryKey]) topCategoryNameMap[p.topCategoryKey] = p.topCategory;
            topCategoryCountMap[p.topCategoryKey] = (topCategoryCountMap[p.topCategoryKey] || 0) + 1;
        }
    });
    const topCategoryKeys = Array.from(new Set(products.map((p) => p.topCategoryKey))).filter(Boolean);

    // Sub-kategoriya ro'yxati — faqat tanlangan top-kategoriya ichidagilar.
    const productsInTopCategory = selectedTopCategory
        ? products.filter((p) => p.topCategoryKey === selectedTopCategory)
        : [];
    const subCategoryNameMap: Record<string, string> = {};
    const subCategoryCountMap: Record<string, number> = {};
    productsInTopCategory.forEach((p) => {
        if (p.categoryKey) {
            if (!subCategoryNameMap[p.categoryKey]) subCategoryNameMap[p.categoryKey] = p.category;
            subCategoryCountMap[p.categoryKey] = (subCategoryCountMap[p.categoryKey] || 0) + 1;
        }
    });
    const subCategoryKeys = Array.from(new Set(productsInTopCategory.map((p) => p.categoryKey))).filter(Boolean);

    const openFilterSheet = () => {
        setSheetLevel(selectedTopCategory ? 'sub' : 'top');
        setIsFilterOpen(true);
    };

    const pickTopCategory = (key: string | null) => {
        setSelectedTopCategory(key);
        setSelectedCategory(null);
        if (key === null) { setIsFilterOpen(false); return; }
        const hasSub = Array.from(new Set(products.filter((p) => p.topCategoryKey === key).map((p) => p.categoryKey))).filter(Boolean).length > 0;
        if (hasSub) setSheetLevel('sub');
        else setIsFilterOpen(false);
    };

    const pickSubCategory = (key: string | null) => {
        setSelectedCategory(key);
        setIsFilterOpen(false);
    };

    const clearFilter = () => {
        setSelectedTopCategory(null);
        setSelectedCategory(null);
    };

    const filterLabel = selectedTopCategory
        ? (topCategoryNameMap[selectedTopCategory] || selectedTopCategory) + (selectedCategory ? ` · ${subCategoryNameMap[selectedCategory] || selectedCategory}` : '')
        : (lang === 'uz' ? 'Kategoriya' : (lang === 'ru' ? 'Категория' : 'Category'));

    const isFilterActive = selectedTopCategory !== null;

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
                            <p className="text-sm text-slate-500 font-medium">{countLabel(filteredProducts.length)}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1 min-w-0">
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
                            <button
                                onClick={openFilterSheet}
                                className={`shrink-0 max-w-[42%] flex items-center gap-1.5 px-3.5 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95 ${
                                    isFilterActive
                                        ? "bg-primary/10 border-primary/40 text-primary"
                                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                <SlidersHorizontal className="w-4 h-4 shrink-0" />
                                <span className="truncate">{filterLabel}</span>
                                {isFilterActive && (
                                    <span
                                        role="button"
                                        onClick={(e) => { e.stopPropagation(); clearFilter(); }}
                                        className="shrink-0 w-4 h-4 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
                                    >
                                        <X className="w-2.5 h-2.5" />
                                    </span>
                                )}
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

            {isFilterOpen && (
                <div
                    className="fixed inset-0 z-[999] flex items-end justify-center bg-black/50"
                    onClick={() => setIsFilterOpen(false)}
                >
                    <div
                        className="bg-white rounded-t-3xl shadow-[0_-20px_40px_rgb(0,0,0,0.15)] w-full max-w-2xl max-h-[75vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
                            <div className="flex items-center gap-2 min-w-0">
                                {sheetLevel === 'sub' && (
                                    <button
                                        onClick={() => setSheetLevel('top')}
                                        className="w-8 h-8 -ml-1 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                                    </button>
                                )}
                                <h3 className="text-lg font-bold text-slate-900 truncate">
                                    {sheetLevel === 'top'
                                        ? (lang === 'uz' ? 'Kategoriya tanlang' : (lang === 'ru' ? 'Выберите категорию' : 'Select category'))
                                        : (topCategoryNameMap[selectedTopCategory || ''] || selectedTopCategory)}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        <div className="overflow-y-auto px-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                            {sheetLevel === 'top' ? (
                                <>
                                    <button
                                        onClick={() => pickTopCategory(null)}
                                        className={`w-full flex items-center justify-between px-3 py-3.5 rounded-2xl transition-colors ${
                                            selectedTopCategory === null ? "bg-primary/10" : "hover:bg-slate-50"
                                        }`}
                                    >
                                        <span className={`text-[15px] font-semibold ${selectedTopCategory === null ? "text-primary" : "text-slate-800"}`}>
                                            {t('home.all')}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">{countLabel(products.length)}</span>
                                    </button>
                                    {topCategoryKeys.map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => pickTopCategory(key)}
                                            className={`w-full flex items-center justify-between px-3 py-3.5 rounded-2xl transition-colors ${
                                                selectedTopCategory === key ? "bg-primary/10" : "hover:bg-slate-50"
                                            }`}
                                        >
                                            <span className={`text-[15px] font-semibold text-left ${selectedTopCategory === key ? "text-primary" : "text-slate-800"}`}>
                                                {topCategoryNameMap[key] || key}
                                            </span>
                                            <span className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-slate-400 font-medium">{countLabel(topCategoryCountMap[key] || 0)}</span>
                                                <ChevronRight className="w-4 h-4 text-slate-300" />
                                            </span>
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => pickSubCategory(null)}
                                        className={`w-full flex items-center justify-between px-3 py-3.5 rounded-2xl transition-colors ${
                                            selectedCategory === null ? "bg-primary/10" : "hover:bg-slate-50"
                                        }`}
                                    >
                                        <span className={`text-[15px] font-semibold ${selectedCategory === null ? "text-primary" : "text-slate-800"}`}>
                                            {t('home.all')}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">{countLabel(productsInTopCategory.length)}</span>
                                    </button>
                                    {subCategoryKeys.map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => pickSubCategory(key)}
                                            className={`w-full flex items-center justify-between px-3 py-3.5 rounded-2xl transition-colors ${
                                                selectedCategory === key ? "bg-primary/10" : "hover:bg-slate-50"
                                            }`}
                                        >
                                            <span className={`text-[15px] font-semibold text-left ${selectedCategory === key ? "text-primary" : "text-slate-800"}`}>
                                                {subCategoryNameMap[key] || key}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium shrink-0">{countLabel(subCategoryCountMap[key] || 0)}</span>
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
