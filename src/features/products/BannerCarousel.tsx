import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Banner {
  id: string;
  image: string;
  link?: string;
  order?: number;
}

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const navigate = useNavigate();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const q = query(collection(db, "banners"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setBanners(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Banner)));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    indexRef.current = 0;

    const interval = setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;

      indexRef.current = (indexRef.current + 1) % banners.length;
      const target = el.children[indexRef.current] as HTMLElement | undefined;
      if (!target) return;

      el.scrollTo({ left: target.offsetLeft - el.offsetLeft, behavior: "smooth" });
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const handleBannerClick = (link?: string) => {
    if (!link) return;
    if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_blank");
    } else {
      navigate(link);
    }
  };

  return (
    <div
      ref={scrollerRef}
      className="flex w-full overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 pb-1 gap-3"
    >
      {banners.map((banner) => (
        <div
          key={banner.id}
          onClick={() => handleBannerClick(banner.link)}
          className={`flex-shrink-0 snap-center ${banners.length > 1 ? "w-[88vw] max-w-[420px]" : "w-full"} aspect-[16/7] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-50/50 bg-slate-100 ${banner.link ? "cursor-pointer active:scale-[0.98]" : ""} transition-transform`}
        >
          <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}
