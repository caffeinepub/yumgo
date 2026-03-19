import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { useStore } from "./hooks/useStore";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import OrderConfirmed from "./pages/OrderConfirmed";
import PaymentPage from "./pages/PaymentPage";
import ShopMenu from "./pages/ShopMenu";
import StudentHome from "./pages/StudentHome";
import OrderHistory from "./pages/owner/OrderHistory";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerMenu from "./pages/owner/OwnerMenu";
import OwnerSettings from "./pages/owner/OwnerSettings";

export type Page =
  | "login"
  | "home"
  | "shop"
  | "checkout"
  | "payment"
  | "order-confirmed"
  | "owner"
  | "owner-settings"
  | "owner-menu"
  | "owner-history";

export interface NavState {
  page: Page;
  shopId?: string;
}

export default function App() {
  const store = useStore();
  const [nav, setNav] = useState<NavState>(() => {
    // Initialize from session immediately to avoid flash
    const session = store.getSession();
    if (session) {
      return { page: session.role === "shopOwner" ? "owner" : "home" };
    }
    return { page: "login" };
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    const session = store.getSession();
    if (session) {
      if (session.role === "shopOwner") setNav({ page: "owner" });
      else setNav({ page: "home" });
    }
  }, []);

  function navigate(page: Page, shopId?: string) {
    setNav({ page, shopId });
    window.scrollTo(0, 0);
  }

  function onLogin(role: "student" | "shopOwner") {
    navigate(role === "shopOwner" ? "owner" : "home");
  }

  function onLogout() {
    store.setSession(null);
    navigate("login");
  }

  const { page, shopId } = nav;

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-center" />
      {page === "login" && <LoginPage onLogin={onLogin} navigate={navigate} />}
      {page === "home" && (
        <StudentHome store={store} navigate={navigate} onLogout={onLogout} />
      )}
      {page === "shop" && shopId && (
        <ShopMenu store={store} shopId={shopId} navigate={navigate} />
      )}
      {page === "checkout" && (
        <CheckoutPage store={store} navigate={navigate} />
      )}
      {page === "payment" && <PaymentPage store={store} navigate={navigate} />}
      {page === "order-confirmed" && (
        <OrderConfirmed store={store} navigate={navigate} />
      )}
      {page === "owner" && (
        <OwnerDashboard store={store} navigate={navigate} onLogout={onLogout} />
      )}
      {page === "owner-settings" && (
        <OwnerSettings store={store} navigate={navigate} />
      )}
      {page === "owner-menu" && <OwnerMenu store={store} navigate={navigate} />}
      {page === "owner-history" && (
        <OrderHistory store={store} navigate={navigate} />
      )}
    </div>
  );
}
