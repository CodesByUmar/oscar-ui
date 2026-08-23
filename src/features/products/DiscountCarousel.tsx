import { useEffect, useRef } from "react";
import { useProductStore } from "@/store/productStore";
import { isDiscountActive } from "@/utils/discount";
import { useI18nStore } from "@/store/i18nStore";
import { ProductCard } from "@/features/products/ProductCard";

export function DiscountCarousel() {
  const products = useProductStore((state) => state.products);
  const discountProducts = products.filter(isDiscountActive);
  const t = useI18nStore((s) => s.t);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (discountProducts.length <= 1) return;
    indexRef.current = 0;

    const interval = setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;

      indexRef.current = (indexRef.current + 1) % discountProducts.length;
      const target = el.children[indexRef.current] as HTMLElement | undefined;
      if (!target) return;

      // Har doim ro'yxatning boshiga (index 0 ga) qaytganda ham xuddi shu tarzda
      // silliq siljiydi — hech qachon "to'xtab qolmaydi".
      el.scrollTo({ left: target.offsetLeft - el.offsetLeft, behavior: "smooth" });
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountProducts.length]);

  if (discountProducts.length === 0) return null;

  return (
    <div className="mt-4 mb-4">
      <div className="px-4 mb-3">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span className="bg-red-500 w-2 h-6 rounded-full inline-block"></span>
          {t('discountCarousel.discount')}
        </h2>
      </div>

      <div
        ref={scrollerRef}
        className="flex w-full overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 pb-6 gap-4"
      >
        {discountProducts.map((product) => (
          <div key={`discount-${product.id}`} className="flex-shrink-0 snap-start w-[46vw] max-w-[190px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}