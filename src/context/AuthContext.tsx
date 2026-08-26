import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// MUHIM: VIP login/parol endi Firestore'dan to'g'ridan-to'g'ri o'qilmaydi —
// Firestore qoidalari buni taqiqlaydi. Parol tekshiruvi admin-bot serverida
// (Admin SDK bilan) bajariladi, bu yerda faqat shu API chaqiriladi.
const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL as string;

interface AuthUser {
    uid: string;
    email?: string;
    login?: string;
    username: string;
    isVip: boolean;
    isGuest: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signIn: (login: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_USER: AuthUser = {
    uid: "guest",
    email: "",
    login: "guest",
    username: "Mehmon",
    isVip: false,
    isGuest: true,
};

const STORAGE_KEY = "oscar_vip_user";
const TOKEN_KEY = "oscar_vip_token";

function toVipUser(uid: string, data: { login?: string; username?: string }): AuthUser {
    return {
        uid,
        email: "",
        login: data.login || "",
        username: data.username || data.login || "VIP User",
        isVip: true,
        isGuest: false,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            // 1) Avval saqlangan sessiya tokenini tekshiramiz. Token serverda
            // imzolangan bo'lgani uchun mijoz uid'ni o'zgartira olmaydi —
            // eski usulda esa localStorage'dagi uid'ga to'g'ridan-to'g'ri
            // ishonilar edi.
            const savedToken = localStorage.getItem(TOKEN_KEY);
            if (savedToken) {
                try {
                    const res = await fetch(`${ADMIN_API_URL}/api/vip-check`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token: savedToken }),
                    });
                    if (res.ok) {
                        const { user: data } = await res.json();
                        setUser(toVipUser(data.uid, data));
                        setLoading(false);
                        return;
                    }
                } catch {
                    // tarmoq xatosi — pastdagi yo'llarga o'tamiz
                }
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(TOKEN_KEY);
            }

            // 2) Telegram ichida ochilgan bo'lsa, Telegram tomonidan
            // imzolangan initData'ni yuboramiz (initDataUnsafe emas — u
            // mijoz tomonidan o'zgartirilishi mumkin va serverda hech
            // qanday tasdiqlanmaydi).
            const tg = (window as any).Telegram?.WebApp;
            const initData: string | undefined = tg?.initData;

            if (initData) {
                try {
                    const res = await fetch(`${ADMIN_API_URL}/api/vip-telegram-check`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ initData }),
                    });
                    if (res.ok) {
                        const { user: data, token } = await res.json();
                        setUser(toVipUser(data.uid, data));
                        if (token) localStorage.setItem(TOKEN_KEY, token);
                        setLoading(false);
                        return;
                    }
                } catch (error) {
                    console.error("Telegram VIP tekshirishda xato:", error);
                }
            }

            // 3) Hech biri topilmasa - mehmon
            setUser(GUEST_USER);
            setLoading(false);
        })();
    }, []);

    const signIn = async (login: string, password: string) => {
        const trimmedLogin = login.trim();
        if (!trimmedLogin || !password) {
            throw new Error("Login va parolni kiriting");
        }

        const res = await fetch(`${ADMIN_API_URL}/api/vip-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login: trimmedLogin, password }),
        });

        if (!res.ok) {
            throw new Error("Login yoki parol noto'g'ri");
        }

        const { user: data, token } = await res.json();
        const vipUser = toVipUser(data.uid, data);

        setUser(vipUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vipUser));
        if (token) localStorage.setItem(TOKEN_KEY, token);
    };

    const signOut = async () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
        setUser(GUEST_USER);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}


// ======================================= TEST ===========================================================

// import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// interface AuthUser {
//     uid: string;
//     email?: string;
//     username: string;
//     isVip: boolean;
//     isGuest: boolean;
// }

// interface AuthContextType {
//     user: AuthUser | null;
//     loading: boolean;
//     signIn: (email: string, password: string) => Promise<void>;
//     signOut: () => Promise<void>;
// }

// // ✅ TEST CREDENTIALS (Firebase yo'q)
// const TEST_VIP_USER = {
//     uid: "test_vip_001",
//     email: "test@oscar.uz",
//     username: "test_vip",
//     password: "test123",
//     isVip: true,
//     isGuest: false,
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//     const [user, setUser] = useState<AuthUser | null>(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const saved = localStorage.getItem("oscar_auth_user");
//         if (saved) {
//             try {
//                 setUser(JSON.parse(saved));
//             } catch {
//                 setUser({ uid: "guest", username: "Mehmon", isVip: false, isGuest: true });
//             }
//         } else {
//             setUser({ uid: "guest", username: "Mehmon", isVip: false, isGuest: true });
//         }
//         setLoading(false);
//     }, []);

//     const signIn = async (email: string, password: string) => {
//         if (email === TEST_VIP_USER.email && password === TEST_VIP_USER.password) {
//             const vipUser = {
//                 uid: TEST_VIP_USER.uid,
//                 email: TEST_VIP_USER.email,
//                 username: TEST_VIP_USER.username,
//                 isVip: true,
//                 isGuest: false,
//             };
//             setUser(vipUser);
//             localStorage.setItem("oscar_auth_user", JSON.stringify(vipUser));
//         } else {
//             throw new Error("Email yoki parol noto'g'ri");
//         }
//     };

//     const signOut = async () => {
//         localStorage.removeItem("oscar_auth_user");
//         setUser({ uid: "guest", username: "Mehmon", isVip: false, isGuest: true });
//     };

//     return (
//         <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// export function useAuth() {
//     const context = useContext(AuthContext);
//     if (context === undefined) {
//         throw new Error("useAuth must be used within an AuthProvider");
//     }
//     return context;
// }