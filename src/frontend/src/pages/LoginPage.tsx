import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { extractDomain, useStore } from "../hooks/useStore";

interface Props {
  onLogin: (role: "student" | "shopOwner") => void;
  navigate: (page: Page, shopId?: string) => void;
}

const floatingEmojis = [
  {
    id: "f1",
    emoji: "🍕",
    top: "8%",
    left: "5%",
    size: "2.8rem",
    rotate: "-15deg",
  },
  {
    id: "f2",
    emoji: "🍔",
    top: "15%",
    right: "8%",
    size: "2.2rem",
    rotate: "12deg",
  },
  {
    id: "f3",
    emoji: "🥗",
    top: "40%",
    left: "3%",
    size: "2rem",
    rotate: "8deg",
  },
  {
    id: "f4",
    emoji: "🌮",
    bottom: "30%",
    right: "5%",
    size: "2.5rem",
    rotate: "-10deg",
  },
  {
    id: "f5",
    emoji: "🍜",
    bottom: "12%",
    left: "10%",
    size: "2.2rem",
    rotate: "20deg",
  },
  {
    id: "f6",
    emoji: "🥘",
    top: "60%",
    right: "3%",
    size: "1.8rem",
    rotate: "-8deg",
  },
  {
    id: "f7",
    emoji: "🍱",
    top: "75%",
    left: "6%",
    size: "2rem",
    rotate: "15deg",
  },
  {
    id: "f8",
    emoji: "🧆",
    top: "28%",
    left: "12%",
    size: "1.6rem",
    rotate: "-20deg",
  },
  {
    id: "f9",
    emoji: "🍛",
    bottom: "20%",
    right: "12%",
    size: "1.9rem",
    rotate: "5deg",
  },
];

export default function LoginPage({ onLogin }: Props) {
  const store = useStore();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"student" | "shopOwner" | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid college email");
      return;
    }
    if (!role) {
      toast.error("Select your role to continue");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const collegeDomain = extractDomain(email);
      store.setSession({
        email: email.toLowerCase().trim(),
        role,
        collegeDomain,
      });
      setLoading(false);
      onLogin(role);
    }, 600);
  }

  function tryDemo() {
    setEmail("student@demo.edu");
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #f97316 0%, #fb923c 20%, #fbbf24 45%, #f59e0b 65%, #fde68a 85%, #fef3c7 100%)",
      }}
    >
      {/* Floating food emoji decorations */}
      {floatingEmojis.map((item) => (
        <div
          key={item.id}
          className="absolute pointer-events-none select-none"
          style={{
            top: (item as any).top,
            left: (item as any).left,
            right: (item as any).right,
            bottom: (item as any).bottom,
            fontSize: item.size,
            opacity: 0.18,
            transform: `rotate(${item.rotate})`,
            filter: "blur(0.5px)",
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Radial glow blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-80px",
          left: "-80px",
          width: "340px",
          height: "340px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(251,146,60,0.45) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-60px",
          right: "-60px",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo section with glow */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            {/* Warm glow behind logo */}
            <div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,237,213,0.9) 0%, rgba(251,146,60,0.5) 50%, transparent 75%)",
                transform: "scale(1.5)",
              }}
            />
            <img
              src="/assets/uploads/logo.png-1.jpeg"
              alt="YumGo"
              className="relative w-28 h-28 rounded-2xl mx-auto"
              style={{
                mixBlendMode: "multiply",
                filter:
                  "drop-shadow(0 4px 16px rgba(234,88,12,0.4)) drop-shadow(0 0 8px rgba(251,191,36,0.5))",
              }}
            />
          </div>
          <p
            className="mt-3 text-sm font-medium"
            style={{ color: "rgba(120,53,15,0.85)" }}
          >
            Smart pre-order for college canteens
          </p>
        </div>

        {/* Frosted glass form card */}
        <div
          className="rounded-3xl shadow-xl p-6"
          style={{
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-amber-900"
              >
                College Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base rounded-xl bg-white/90"
                autoComplete="email"
                data-ocid="login.input"
              />
              {email.includes("@") && (
                <p className="text-xs text-amber-700">
                  College:{" "}
                  <span className="font-semibold text-orange-600">
                    {extractDomain(email)}
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-amber-900">
                I am a...
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  data-ocid="login.role_student_button"
                  className={`p-4 rounded-2xl border-2 text-center transition-all ${
                    role === "student"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-amber-200 bg-white/80 hover:border-orange-300"
                  }`}
                >
                  <div className="text-3xl mb-1">🎓</div>
                  <div className="font-semibold text-sm">Student</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("shopOwner")}
                  data-ocid="login.role_owner_button"
                  className={`p-4 rounded-2xl border-2 text-center transition-all ${
                    role === "shopOwner"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-amber-200 bg-white/80 hover:border-orange-300"
                  }`}
                >
                  <div className="text-3xl mb-1">🏪</div>
                  <div className="font-semibold text-sm">Shop Owner</div>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold"
              disabled={loading}
              data-ocid="login.submit_button"
            >
              {loading ? "Signing in..." : "Continue"}
            </Button>
          </form>

          <p className="text-center text-xs text-amber-700/80 mt-5">
            Try{" "}
            <button
              type="button"
              className="text-orange-600 font-semibold underline underline-offset-2"
              onClick={tryDemo}
            >
              student@demo.edu
            </button>{" "}
            to explore with demo data
          </p>
        </div>
      </div>
    </div>
  );
}
