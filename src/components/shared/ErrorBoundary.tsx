// src/components/shared/ErrorBoundary.tsx
//
// Hozirgacha React render paytida kutilmagan xato (masalan Yandex Maps
// SDK'ning ba'zi versiyalarida uchraydigan "events.removeAll is not a
// function" kabi ichki xatolar) butun ilovani "oq ekran"ga aylantirar
// edi — foydalanuvchi hech narsa qila olmay qolardi. Bu komponent shu
// xatoni ushlab, orqaga/bosh sahifaga qaytish tugmasi bilan sahifa
// ko'rsatadi.
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Ilovada kutilmagan xato:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white p-6">
          <div className="text-center max-w-xs">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <h1 className="text-lg font-bold text-slate-800 mb-2">Kutilmagan xato yuz berdi</h1>
            <p className="text-sm text-slate-500 mb-6">
              Iltimos, bosh sahifaga qaytib, qaytadan urinib ko'ring.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full h-12 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
