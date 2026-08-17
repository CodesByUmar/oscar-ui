// src/pages/Profile.tsx
import { User, Crown, LogOut } from "lucide-react";
import { Header } from "@/features/header/Header";
import { useI18nStore } from "@/store/i18nStore";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Profile() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const text = {
    logoutButton: lang === 'uz' ? "VIP hisobdan chiqish" : (lang === 'ru' ? "Выйти из VIP-аккаунта" : "Log out of VIP account"),
    logoutTitle: lang === 'uz' ? "VIP hisobdan chiqish" : (lang === 'ru' ? "Выход из VIP-аккаунта" : "Log out of VIP"),
    logoutMessage: lang === 'uz'
      ? "Haqiqatan ham VIP hisobdan chiqmoqchimisiz? Barcha VIP imtiyozlaringizni yo'qotasiz."
      : (lang === 'ru'
        ? "Вы действительно хотите выйти из VIP-аккаунта? Вы потеряете все VIP-привилегии."
        : "Are you sure you want to log out? You will lose all VIP privileges."),
    confirmYes: lang === 'uz' ? "Ha, chiqish" : (lang === 'ru' ? "Да, выйти" : "Yes, log out"),
    cancel: lang === 'uz' ? "Yo'q, qolish" : (lang === 'ru' ? "Нет, остаться" : "No, stay"),
    loading: lang === 'uz' ? "Chiqilmoqda..." : (lang === 'ru' ? "Выход..." : "Logging out..."),
    vipBadge: lang === 'uz' ? "VIP mijoz" : (lang === 'ru' ? "VIP клиент" : "VIP customer"),
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);

  const confirmLogout = async () => {
    if (isLoggingOut) return; // ikki marta bosishning oldini olish
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Chiqishda xato:", error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-[104px]">
      <Header />
      <main className="container pt-6 max-w-2xl mx-auto px-4 space-y-4">

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${user?.isVip ? "bg-gradient-to-br from-yellow-400 to-orange-500" : "bg-primary/10"
            }`}>
            {user?.isVip ? (
              <Crown className="w-8 h-8 text-white" />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-1">{t('profile.title')}</h2>

          {user?.isVip ? (
            <>
              <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                {text.vipBadge}
              </span>
              {user.login && (
                <p className="text-slate-500 text-sm mb-4">{user.login}</p>
              )}
            </>
          ) : (
            <p className="text-slate-500 text-sm mb-2">{t('profile.coming_soon')}</p>
          )}
        </div>

        {/* Faqat VIP foydalanuvchiga chiqish tugmasi ko'rinadi */}
        {user?.isVip && (
          <button
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            className="w-full h-12 rounded-xl font-semibold border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {isLoggingOut ? text.loading : text.logoutButton}
          </button>
        )}

      </main>

      {/* Tasdiqlash oynasi - shu faylning ICHIDA, tashqi komponentga bog'liq emas */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2">{text.logoutTitle}</h3>
            <p className="text-slate-600 text-sm mb-6">{text.logoutMessage}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="flex-1 h-11 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-60 transition-colors"
              >
                {text.cancel}
              </button>
              <button
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="flex-1 h-11 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {isLoggingOut ? text.loading : text.confirmYes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}