// src/features/header/Header.tsx
import { useState } from "react";
import { Bell, Search, LogOut, LogIn, Phone, Copy, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useNotificationStore } from "@/store/notificationStore";
import { NotificationModal } from "@/features/notifications/NotificationModal";
import { SearchModal } from "@/features/search/SearchModal";
import { useI18nStore } from "@/store/i18nStore";
import { useAuth } from "@/context/AuthContext";  // ✅ to'g'ri import

export function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const unreadCount = useNotificationStore((state) => state.unreadCount());
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showCallCenter, setShowCallCenter] = useState(false);
  const [copied, setCopied] = useState(false);
  const { lang, setLang } = useI18nStore();

  const langs = ['uz', 'ru', 'en'] as const;
  const callCenterText = {
    label: lang === 'uz' ? "Call Center" : (lang === 'ru' ? "Колл-центр" : "Call Center"),
    copyBtn: lang === 'uz' ? "Nusxa olish" : (lang === 'ru' ? "Скопировать" : "Copy"),
    copiedBtn: lang === 'uz' ? "Nusxa olindi!" : (lang === 'ru' ? "Скопировано!" : "Copied!"),
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText("+998555111166");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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
          <Link to="/" className="flex items-center gap-2">
            <img src="/image.png" alt="Oscar" className="w-full h-[35px]" />
          </Link>
          <nav className="flex items-center gap-1">
            {/* Til tanlash */}
            <div className="flex items-center bg-slate-100 rounded-full p-0.5 mr-1">
              {langs.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase transition-all ${lang === l
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
              className="p-2 rounded-full hover:bg-slate-100"
            >
              <Search className="h-6 w-6 text-slate-700" />
            </button>

            <button
              onClick={() => setNotificationOpen(true)}
              className="relative p-2 rounded-full hover:bg-slate-100"
            >
              <Bell className="h-6 w-6 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-primary rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowCallCenter(true)}
              className="p-2 rounded-full hover:bg-slate-100"
              title="Call Center"
            >
              <Phone className="h-5 w-5 text-slate-700" />
            </button>
            <button
              onClick={handleAuthClick}
              className={`flex items-center justify-center p-2 rounded-full ${user?.isVip
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              style={{
                display: isTelegram ? 'flex' : 'flex', // Telegramda ham ko'rsatish
                zIndex: isTelegram ? 9999 : 'auto',
              }}
            >
              {user?.isVip ? (
                <LogOut className="w-5 h-5" />
              ) : (
                <LogIn className="w-5 h-5" />
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
            className="bg-white rounded-2xl shadow-xl max-w-xs w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 mb-1">{callCenterText.label}</h3>
            <p className="text-2xl font-bold text-slate-900 mb-4 tracking-wide">+998 55 511 11 66</p>
            <button
              onClick={handleCopyPhone}
              className="w-full h-11 rounded-xl font-semibold bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  {callCenterText.copiedBtn}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {callCenterText.copyBtn}
                </>
              )}
            </button>
          </div>
        </div>
      )}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}