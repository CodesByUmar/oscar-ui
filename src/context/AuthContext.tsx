import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            // 1) Avval saqlangan VIP sessiyani tekshiramiz (localStorage)
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsedUser: AuthUser = JSON.parse(saved);
                    // Hali ham VIP ekanini Firestore'dan tasdiqlaymiz (o'chirilgan bo'lishi mumkin)
                    const vipDoc = await getDoc(doc(db, "VIP_Clients", parsedUser.uid));
                    if (vipDoc.exists()) {
                        setUser(parsedUser);
                        setLoading(false);
                        return;
                    } else {
                        localStorage.removeItem(STORAGE_KEY);
                    }
                } catch {
                    localStorage.removeItem(STORAGE_KEY);
                }
            }

            // 2) Telegram foydalanuvchisi VIP ro'yxatida bormi, tekshiramiz
            const tg = (window as any).Telegram?.WebApp;
            const tgUser = tg?.initDataUnsafe?.user;

            if (tgUser) {
                try {
                    const vipDoc = await getDoc(doc(db, "VIP_Clients", String(tgUser.id)));
                    if (vipDoc.exists()) {
                        const data = vipDoc.data();
                        setUser({
                            uid: String(tgUser.id),
                            email: "",
                            login: data.login || "",
                            username: data.username || data.login || "VIP User",
                            isVip: true,
                            isGuest: false,
                        });
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

        const q = query(
            collection(db, "VIP_Clients"),
            where("login", "==", trimmedLogin)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
            throw new Error("Login yoki parol noto'g'ri");
        }

        const vipDoc = snap.docs[0];
        const data = vipDoc.data();

        if (data.password !== password) {
            throw new Error("Login yoki parol noto'g'ri");
        }

        const vipUser: AuthUser = {
            uid: vipDoc.id,
            email: "",
            login: data.login || trimmedLogin,
            username: data.username || data.login || "VIP User",
            isVip: true,
            isGuest: false,
        };

        setUser(vipUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vipUser));
    };

    const signOut = async () => {
        localStorage.removeItem(STORAGE_KEY);
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