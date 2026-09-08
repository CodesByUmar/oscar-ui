// src/pages/Location.tsx
import { useEffect, useState } from "react";
import { MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/features/header/Header";
import { Button } from "@/components/ui/button";
import { useI18nStore } from "@/store/i18nStore";
import { openExternalLink } from "@/lib/utils";

interface StoreLocation {
  id: string;
  name: string;
  phone?: string;
  lat: number;
  lng: number;
  order?: number;
}

// Admin bot orqali tahrirlanadigan haqiqiy manba (storeContacts) topilmaguncha
// yoki tarmoq xatosida ko'rsatiladigan zaxira ro'yxat.
const FALLBACK_STORES: StoreLocation[] = [
  { id: "oscar_150", name: "150-151 OSCAR", phone: "+998900471150", lat: 41.2866446, lng: 69.1498683 },
  { id: "xtra_1036", name: "10-36 X-TRA", phone: "+998774441036", lat: 41.2866446, lng: 69.1498683 },
  { id: "showroom", name: "SHOWROOM", phone: "+998981110809", lat: 41.3485214, lng: 69.1588695 },
];

// Yandex Navigator (o'rnatilgan bo'lsa) yoki Yandex Maps'ni (veb/ilova)
// foydalanuvchining joriy joylashuvidan tanlangan do'konga yo'nalish bilan
// ochadi. Avval mobil ilova sxemasini sinaymiz — agar sahifa hamon ko'rinib
// tursa (ilova ochilmagan bo'lsa), qisqa vaqtdan so'ng veb-versiyaga tushamiz.
function openYandexNavigation(lat: number, lng: number) {
  const webUrl = `https://yandex.uz/maps/?rtext=~${lat},${lng}&rtt=auto`;
  const appUrl = `yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lng}`;

  let didFallback = false;
  const fallbackToWeb = () => {
    if (didFallback) return;
    didFallback = true;
    openExternalLink(webUrl);
  };

  const timer = setTimeout(fallbackToWeb, 1200);
  window.addEventListener("blur", () => { didFallback = true; clearTimeout(timer); }, { once: true });

  try {
    window.location.href = appUrl;
  } catch {
    clearTimeout(timer);
    fallbackToWeb();
  }
}

export function LocationPage() {
  const t = useI18nStore((s) => s.t);
  const [stores, setStores] = useState<StoreLocation[]>(FALLBACK_STORES);

  useEffect(() => {
    getDocs(collection(db, "storeContacts")).then((snap) => {
      if (snap.empty) return;
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<StoreLocation, 'id'>) }))
        .filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number')
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      if (list.length > 0) setStores(list);
    }).catch((error) => {
      console.error("Do'kon manzillarini yuklashda xato:", error);
    });
  }, []);

  const handleSupportOpen = () => {
    openExternalLink("https://t.me/asatilayev");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-[104px]">
      <Header />
      <main className="container pt-6 max-w-xl mx-auto px-4 space-y-6">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-5 pb-4 border-b border-slate-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-slate-800">{store.name}</h2>
                {store.phone && <p className="text-xs text-slate-500 font-medium mt-0.5">{store.phone}</p>}
              </div>
            </div>
            <div
              className="w-full h-[220px] bg-slate-100 relative cursor-pointer"
              onClick={() => openYandexNavigation(store.lat, store.lng)}
            >
              <iframe
                src={`https://www.google.com/maps?q=${store.lat},${store.lng}&output=embed&hl=uz`}
                className="w-full h-full border-0 absolute inset-0 pointer-events-none"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="p-4 flex gap-3">
              <Button
                onClick={() => openYandexNavigation(store.lat, store.lng)}
                className="flex-1 h-11 rounded-xl font-bold gap-2"
              >
                <Navigation className="w-4 h-4" />
                {t('location.get_directions')}
              </Button>
              {store.phone && (
                <a href={`tel:${store.phone}`} className="shrink-0">
                  <Button variant="outline" className="h-11 w-11 rounded-xl p-0 border-2 border-slate-200">
                    <Phone className="w-4 h-4 text-slate-700" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        ))}

        {/* Support Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex items-center gap-5">
          <div className="w-14 h-14 bg-[#0088cc]/10 text-[#0088cc] rounded-2xl flex items-center justify-center shrink-0">
            <MessageCircle className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 text-sm mb-1">{t('location.support_title')}</h3>
            <p className="text-xs text-slate-500 font-medium">{t('location.support_desc')}</p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleSupportOpen}
          className="w-full h-14 rounded-2xl text-[15px] font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all"
        >
          {t('location.support_btn')}
        </Button>
      </main>
    </div>
  );
}
