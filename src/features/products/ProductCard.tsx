import { formatUZS } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { resolveI18n, type Product } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";

import { isDiscountActive, getEffectivePrice, formatDiscountPeriod } from "@/utils/discount";
import { useSettingsStore } from "@/store/settingsStore";
import { useI18nStore } from "@/store/i18nStore";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const lang = useI18nStore((s) => s.lang);

  const hasDiscount = isDiscountActive(product);
  const discountPercent = product.discount || 0;

  // Kartochkada har doim DONA narxi ko'rsatiladi (savatga qo'shish tugmasi ham
  // pricePiece'dan foydalanadi) — mahsulot tafsiloti sahifasidagi "Dona" bilan bir xil hisoblash.
  const USD_TO_UZS = useSettingsStore((s) => s.usdRate);
  const computedPriceUSD = getEffectivePrice(product, product.pricePiece);
  const originalPriceUZS = Math.round(product.pricePiece * USD_TO_UZS);
  const computedPriceUZS = Math.round(computedPriceUSD * USD_TO_UZS);

  const displayTitle = product.nameI18n
    ? resolveI18n(product.nameI18n, lang, product.name)
    : (product.name || '—');
  const displayImage = product.image;

  const discountPeriod = formatDiscountPeriod(product);
  const finalStart = discountPeriod ? discountPeriod.split('–')[0] : null;
  const finalEnd = discountPeriod ? discountPeriod.split('–')[1] : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Add to cart maps to item (pricePiece)
    const finalPrice = getEffectivePrice(product, product.pricePiece);

    addItem({
      productId: product.id,
      name: displayTitle,
      price: finalPrice,
      originalPrice: product.pricePiece,
      discount: discountPercent,
      quantity: 1,
      image: displayImage,
      unit: 'item',
    });
  };



  return (
    <div className="relative group touch-manipulation h-full">
      <Link
        to={`/product/${product.id}`}
        className="flex flex-col bg-white h-full rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,200,255,0.08)] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0"
      >
        <div className="aspect-[4/3] w-full relative mb-3 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/50 flex-shrink-0 flex items-center justify-center">

          {/* DISCOUNT DATE BADGE (TOP OVER IMAGE) */}
          {hasDiscount && finalStart && finalEnd && (
            <div className="absolute top-2 left-2 bg-primary/10 text-primary rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-bold shadow-sm whitespace-nowrap z-10">
              {finalStart}–{finalEnd}
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 text-[10px] sm:text-xs font-bold shadow-sm z-10">
              -{discountPercent}%
            </div>
          )}



          <img
            src={displayImage || undefined}
            alt={displayTitle}
            className="object-contain h-[150px] sm:h-full w-full transition-transform duration-500 group-hover:scale-110 z-0"
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }}
          />
          <div className="hidden absolute inset-0 bg-slate-200 rounded-2xl z-0"></div>
        </div>

        <div className="flex flex-col flex-1 px-1 mt-1">
          <div className="min-h-[44px] mb-2">
            <h3 className="font-semibold text-slate-800 line-clamp-2 text-[14px] sm:text-[15px] leading-[20px]">
              {displayTitle}
            </h3>
          </div>

          <div className="mt-auto pr-12 pb-1">
            {hasDiscount && (
              <p className="text-slate-400 text-[11px] line-through leading-none mb-0.5">
                {formatUZS(originalPriceUZS)} UZS
              </p>
            )}
            <p className="font-extrabold text-slate-900 text-[15px] sm:text-[16px] leading-none tracking-tight">
              {formatUZS(computedPriceUZS)} <span className="text-[11px] font-bold text-slate-500">UZS</span>
            </p>
            <p className="font-medium text-slate-400 text-[10px] sm:text-[11px] leading-none tracking-wide mt-1">
              {product.priceBox > 0 && product.pricePiece > 0
                ? `≈ ${getEffectivePrice(product, product.pricePiece).toFixed(2)} / ${lang === 'uz' ? 'dona' : (lang === 'ru' ? 'шт' : 'item')}`
                : (product.priceBox > 0 ? (lang === 'uz' ? 'karobka' : (lang === 'ru' ? 'коробка' : 'box')) : (lang === 'uz' ? 'dona' : (lang === 'ru' ? 'шт' : 'item')))}
            </p>
          </div>
        </div>
      </Link>

      <Button
        size="icon"
        onClick={handleAddToCart}
        className="absolute bottom-3 right-3 h-[42px] w-[42px] rounded-full shadow-lg shadow-primary/25 hover:scale-110 active:scale-95 transition-all z-30"
      >
        <ShoppingCart className="h-[20px] w-[20px]" />
      </Button>
    </div>
  );
}
