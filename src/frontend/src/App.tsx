import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { useStore } from "./hooks/useStore";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import OrderConfirmed from "./pages/OrderConfirmed";
import PaymentPage from "./pages/PaymentPage";
import ShopMenu from "./pages/ShopMenu";
import StudentHome from "./pages/StudentHome";
import WelcomePage from "./pages/WelcomePage";
import OrderHistory from "./pages/owner/OrderHistory";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerMenu from "./pages/owner/OwnerMenu";
import OwnerSettings from "./pages/owner/OwnerSettings";

export type Page =
  | "welcome"
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
  const [nav, setNav] = useState<NavState>({ page: "welcome" });

  function navigate(page: Page, shopId?: string) {
    setNav({ page, shopId });
    window.scrollTo(0, 0);
  }

  function onWelcomeDone() {
    const session = store.getSession();
    if (session) {
      navigate(session.role === "shopOwner" ? "owner" : "home");
    } else {
      navigate("login");
    }
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
    <div className="min-h-screen" style={{ background: "#1a1a2e" }}>
      <Toaster richColors position="top-center" />
      {page === "welcome" && <WelcomePage onDone={onWelcomeDone} />}
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
