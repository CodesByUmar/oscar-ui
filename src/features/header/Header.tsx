// src/features/header/Header.tsx
import { useEffect, useState } from "react";
import { Bell, Search, LogOut, LogIn, Phone, Copy, Check, Crown, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNotificationStore } from "@/store/notificationStore";
import { NotificationModal } from "@/features/notifications/NotificationModal";
import { SearchModal } from "@/features/search/SearchModal";
import { useI18nStore } from "@/store/i18nStore";
import { useAuth } from "@/context/AuthContext";  // ✅ to'g'ri import

interface StoreContact {
  id: string;
  name: string;
  phone: string;
  telegramUsername?: string;
  order?: number;
}

// Admin bot orqali tahrirlanadigan haqiqiy manba topilmaguncha (yoki
// tarmoq xatosida) ko'rsatiladigan zaxira ro'yxat — hech qachon bo'sh
// oyna ko'rinmasligi uchun.
const FALLBACK_STORES: StoreContact[] = [
  { id: "oscar_150", name: "150-151 OSCAR", phone: "+998900471150" },
  { id: "xtra_1036", name: "10-36 X-TRA", phone: "+998774441036" },
  { id: "showroom", name: "SHOWROOM", phone: "+998981110809" },
];

export function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const unreadCount = useNotificationStore((state) => state.unreadCount());
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showCallCenter, setShowCallCenter] = useState(false);
  const { lang, setLang } = useI18nStore();

  const langs = ['uz', 'ru', 'en'] as const;
  const callCenterText = {
    label: lang === 'uz' ? "Call Center" : (lang === 'ru' ? "Колл-центр" : "Call Center"),
    callBtn: lang === 'uz' ? "Qo'ng'iroq qilish" : (lang === 'ru' ? "Позвонить" : "Call"),
    copyBtn: lang === 'uz' ? "Nusxa olish" : (lang === 'ru' ? "Скопировать" : "Copy"),
    copiedBtn: lang === 'uz' ? "Nusxa olindi!" : (lang === 'ru' ? "Скопировано!" : "Copied!"),
  };

  // Har bir do'kon/filial uchun alohida qo'ng'iroq raqami va Telegram
  // kontakti — admin bot orqali ("🏪 Do'kon kontaktlari") tahrirlanadi.
  // Oyna ochilgandagina bir marta o'qiladi (doim ochiq tinglovchi shart
  // emas — bu ma'lumot kamdan-kam o'zgaradi).
  const [stores, setStores] = useState<StoreContact[]>(FALLBACK_STORES);
  useEffect(() => {
    if (!showCallCenter) return;
    let cancelled = false;
    getDocs(collection(db, "storeContacts")).then((snap) => {
      if (cancelled || snap.empty) return;
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<StoreContact, 'id'>) }))
        .filter((s) => s.phone)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      if (list.length > 0) setStores(list);
    }).catch((error) => {
      console.error("Do'kon kontaktlarini yuklashda xato:", error);
    });
    return () => { cancelled = true; };
  }, [showCallCenter]);

  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const handleCopyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 1500);
    } catch (error) {
      console.error("Nusxa olishda xato:", error);
    }
  };
  const logoutText = {
    title: lang === 'uz' ? "VIP hisobdan chiqish" : (lang === 'ru' ? "Выход из VIP-аккаунта" : "Log out of VIP"),
    message: lang === 'uz'
      ? "Haqiqatan ham VIP hisobdan chiqmoqchimisiz? Barcha VIP imtiyozlaringizni yo'qotasiz."
      : (lang === 'ru'
        ? "Вы действительно хотите выйти из VIP-аккаунта? Вы потеряете все VIP-привилегии."
        : "Are you sure you want to log out? You will lose all VIP privileges."),
    confirm: lang === 'uz' ? "Ha, chiqish" : (lang === 'ru' ? "Да, выйти" : "Yes, log out"),
    cancel: lang === 'uz' ? "Yo'q, qolish" : (lang === 'ru' ? "Нет, остаться" : "No, stay"),
  };

  const handleAuthClick = () => {
    if (user?.isVip) {
      setShowLogoutConfirm(true); // ⬅️ endi darhol chiqmaydi, tasdiqlash so'raydi
    } else {
      navigate("/signin");
    }
  };

  const confirmLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut();
      setShowLogoutConfirm(false);
      navigate("/");
    } catch (error) {
      console.error("Chiqishda xato:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isTelegram = !!(window as any).Telegram?.WebApp;


  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4 max-w-2xl mx-auto">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/image.png" alt="Oscar" className="h-[28px] sm:h-[32px] w-auto" />
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {/* Til tanlash */}
            <div className="flex items-center bg-slate-100 rounded-full p-0.5 mr-0.5 sm:mr-1">
              {langs.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase transition-all ${lang === l
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100"
            >
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" />
            </button>

            <button
              onClick={() => setNotificationOpen(true)}
              className="relative p-1.5 sm:p-2 rounded-full hover:bg-slate-100"
            >
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 text-[10px] font-bold text-white bg-primary rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowCallCenter(true)}
              className="flex p-1.5 sm:p-2 rounded-full hover:bg-slate-100"
              title="Call Center"
            >
              <Phone className="h-5 w-5 text-slate-700" />
            </button>
            {user?.isVip && (
              <Link
                to="/profile"
                className="flex items-center justify-center p-1.5 sm:p-2 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100"
                title="Profil"
              >
                <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            )}
            <button
              onClick={handleAuthClick}
              className={`flex items-center justify-center p-1.5 sm:p-2 rounded-full ${user?.isVip
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              style={{
                display: isTelegram ? 'flex' : 'flex', // Telegramda ham ko'rsatish
                zIndex: isTelegram ? 9999 : 'auto',
              }}
            >
              {user?.isVip ? (
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </nav>
        </div>
      </header>
      <NotificationModal open={notificationOpen} onOpenChange={setNotificationOpen} />
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2">{logoutText.title}</h3>
            <p className="text-slate-600 text-sm mb-6">{logoutText.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="flex-1 h-11 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-60"
              >
                {logoutText.cancel}
              </button>
              <button
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="flex-1 h-11 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
              >
                {logoutText.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
      {showCallCenter && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCallCenter(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-xs w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 mb-4 text-center">{callCenterText.label}</h3>
            <div className="space-y-3">
              {stores.map((store) => {
                const telHref = `tel:${store.phone}`;
                const isCopied = copiedPhone === store.phone;
                return (
                  <div key={store.id} className="rounded-xl border border-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">{store.name}</p>
                    <a
                      href={telHref}
                      className="block text-lg font-bold text-slate-900 mb-2 tracking-wide hover:text-primary transition-colors"
                    >
                      {store.phone}
                    </a>
                    <div className="flex gap-2">
                      <a
                        href={telHref}
                        className="flex-1 h-9 rounded-lg font-semibold text-xs bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {callCenterText.callBtn}
                      </a>
                      <button
                        onClick={() => handleCopyPhone(store.phone)}
                        className="flex-1 h-9 rounded-lg font-semibold text-xs bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            {callCenterText.copiedBtn}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            {callCenterText.copyBtn}
                          </>
                        )}
                      </button>
                      {store.telegramUsername && (
                        <a
                          href={`https://t.me/${store.telegramUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 shrink-0 rounded-lg bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 flex items-center justify-center transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}