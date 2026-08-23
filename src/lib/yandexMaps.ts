// Yandex Maps JS API (2.1) skriptini yuklash va HTTP Geocoder chaqiruvlari.
// Google Maps billing muammosi tufayli O'zbekiston bo'ylab (12 viloyat) ishlaydigan,
// bepul tarifli Yandex xaritasiga o'tildi.

declare global {
  interface Window {
    ymaps?: any;
  }
}

let loadPromise: Promise<any> | null = null;

export function loadYandexMaps(apiKey: string): Promise<any> {
  if (window.ymaps?.Map) return Promise.resolve(window.ymaps);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=uz_UZ`;
    script.async = true;
    script.onload = () => {
      if (!window.ymaps) {
        reject(new Error("Yandex Maps yuklanmadi"));
        return;
      }
      window.ymaps.ready(() => resolve(window.ymaps));
    };
    script.onerror = () => reject(new Error("Yandex Maps skriptini yuklab bo'lmadi"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

const GEOCODER_URL = "https://geocode-maps.yandex.ru/1.x/";
const GEOCODER_KEY = import.meta.env.VITE_YANDEX_GEOCODER_API_KEY as string | undefined;

// Nuqta (lat,lng) -> manzil matni. Muvaffaqiyatsiz bo'lsa null qaytaradi
// (chaqiruvchi tomon OSM Nominatim'ga fallback qiladi).
export async function yandexReverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!GEOCODER_KEY) return null;
  try {
    const url = `${GEOCODER_URL}?apikey=${GEOCODER_KEY}&geocode=${lng},${lat}&format=json&results=1&lang=uz_UZ`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const member = data?.response?.GeoObjectCollection?.featureMember?.[0];
    return member?.GeoObject?.metaDataProperty?.GeocoderMetaData?.text ?? null;
  } catch {
    return null;
  }
}

// Manzil matni -> nuqta (lat,lng). Muvaffaqiyatsiz bo'lsa null qaytaradi.
export async function yandexForwardGeocode(query: string): Promise<{ lat: number; lng: number } | null> {
  if (!GEOCODER_KEY) return null;
  try {
    const url = `${GEOCODER_URL}?apikey=${GEOCODER_KEY}&geocode=${encodeURIComponent(query)}&format=json&results=1&lang=uz_UZ`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const member = data?.response?.GeoObjectCollection?.featureMember?.[0];
    const pos: string | undefined = member?.GeoObject?.Point?.pos; // "lon lat"
    if (!pos) return null;
    const [lon, lat] = pos.split(" ").map(Number);
    return { lat, lng: lon };
  } catch {
    return null;
  }
}
