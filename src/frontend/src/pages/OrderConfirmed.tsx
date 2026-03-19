import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useRef, useState } from "react";
import type { Page } from "../App";
import type { Order, useStore } from "../hooks/useStore";

type StoreType = ReturnType<typeof useStore>;

interface Props {
  store: StoreType;
  navigate: (page: Page, shopId?: string) => void;
}

const JOLLY_MESSAGES = [
  { text: "Woohoo! Food is on its way!", emoji: "🚀" },
  { text: "You're a legend! Order confirmed!", emoji: "🏆" },
  { text: "Yum yum! Great choice!", emoji: "😋" },
  { text: "Your tummy is going to be very happy!", emoji: "🎊" },
  { text: "Order placed! Time to do a happy dance!", emoji: "💃" },
  { text: "You eat, you slay! Order confirmed!", emoji: "✨" },
  { text: "Canteen, here we come!", emoji: "🍽️" },
];

const CONFETTI_COLORS = [
  "#f97316",
  "#fbbf24",
  "#ef4444",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
];

const SPARKLE_DOTS = [
  { id: "s1", top: "12%", left: "8%", size: 18, delay: "0s" },
  { id: "s2", top: "20%", right: "10%", size: 12, delay: "0.2s" },
  { id: "s3", bottom: "22%", left: "12%", size: 14, delay: "0.1s" },
  { id: "s4", bottom: "15%", right: "8%", size: 20, delay: "0.3s" },
  { id: "s5", top: "55%", left: "5%", size: 10, delay: "0.15s" },
  { id: "s6", top: "35%", right: "5%", size: 16, delay: "0.25s" },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "circle" | "rect";
}

function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        id: i,
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        color:
          CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
        shape: Math.random() > 0.5 ? "circle" : "rect",
      });
    }
    particlesRef.current = particles;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particlesRef.current) {
        if (p.y < canvas.height + 30) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08;
          p.rotation += p.rotationSpeed;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, 1 - p.y / (canvas.height * 1.1));
          if (p.shape === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          }
          ctx.restore();
        }
      }
      if (alive) {
        rafRef.current = requestAnimationFrame(draw);
      }
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 60 }}
    />
  );
}

export default function OrderConfirmed({ store, navigate }: Props) {
  const order = store.getLastOrder();
  const [show, setShow] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(true);
  const [celebrationFading, setCelebrationFading] = useState(false);
  const [confettiActive, setConfettiActive] = useState(true);
  const messageRef = useRef(
    JOLLY_MESSAGES[Math.floor(Math.random() * JOLLY_MESSAGES.length)],
  );

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
    localStorage.removeItem("cart");

    const dismissTimer = setTimeout(() => {
      setCelebrationFading(true);
      setTimeout(() => {
        setCelebrationVisible(false);
        setConfettiActive(false);
      }, 400);
    }, 2500);

    return () => clearTimeout(dismissTimer);
  }, []);

  function dismissCelebration() {
    setCelebrationFading(true);
    setTimeout(() => {
      setCelebrationVisible(false);
      setConfettiActive(false);
    }, 400);
  }

  if (!order) {
    navigate("home");
    return null;
  }

  const msg = messageRef.current;

  return (
    <>
      <ConfettiCanvas active={confettiActive} />

      {celebrationVisible && (
        <button
          type="button"
          className="fixed inset-0 flex flex-col items-center justify-center cursor-pointer w-full border-none p-0"
          style={{
            zIndex: 50,
            background:
              "radial-gradient(ellipse at center, rgba(251,146,60,0.92) 0%, rgba(234,88,12,0.88) 50%, rgba(180,50,0,0.85) 100%)",
            opacity: celebrationFading ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
          onClick={dismissCelebration}
          data-ocid="order.celebration_modal"
        >
          <div
            style={{
              fontSize: "7rem",
              lineHeight: 1,
              animation: "celebBounce 0.6s ease-in-out infinite alternate",
              marginBottom: "1.5rem",
            }}
          >
            {msg.emoji}
          </div>

          <div className="text-center px-8">
            <p
              style={{
                color: "#fff",
                fontSize: "1.6rem",
                fontWeight: 800,
                lineHeight: 1.25,
                textShadow: "0 2px 12px rgba(0,0,0,0.3)",
                animation: "celebSlideUp 0.5s ease both",
              }}
            >
              {msg.text}
            </p>
            <p
              style={{
                color: "rgba(255,237,213,0.9)",
                fontSize: "1rem",
                marginTop: "0.75rem",
                fontWeight: 500,
              }}
            >
              Tap anywhere to continue
            </p>
          </div>

          {SPARKLE_DOTS.map((dot) => (
            <div
              key={dot.id}
              className="absolute rounded-full"
              style={{
                top: (dot as any).top,
                left: (dot as any).left,
                right: (dot as any).right,
                bottom: (dot as any).bottom,
                width: dot.size,
                height: dot.size,
                background: "rgba(255,255,255,0.6)",
                animation: `sparkle 1.2s ${dot.delay} ease-in-out infinite alternate`,
              }}
            />
          ))}
        </button>
      )}

      <style>{`
        @keyframes celebBounce {
          from { transform: translateY(0) scale(1); }
          to { transform: translateY(-18px) scale(1.08); }
        }
        @keyframes celebSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sparkle {
          from { opacity: 0.3; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1.3); }
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
        style={{
          background: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
        }}
      >
        <div
          className={`w-full max-w-sm transition-all duration-500 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
              <span className="text-5xl">✅</span>
            </div>
            <h1 className="font-display text-3xl font-bold">Order Placed!</h1>
            <p className="text-muted-foreground mt-1">
              Your payment is confirmed
            </p>
          </div>

          <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl p-4 text-center mb-4">
            <p className="text-sm text-muted-foreground">Bill Number</p>
            <p className="font-display text-3xl font-bold text-primary tracking-widest mt-1">
              #{order.billNumber}
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-xs p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Order Details</h3>
              <Badge
                variant={
                  order.orderType === "delivery" ? "default" : "secondary"
                }
              >
                {order.orderType === "delivery" ? "📦 Delivery" : "👋 Pickup"}
              </Badge>
            </div>
            <div className="space-y-1">
              {order.items.map((item) => (
                <div key={item.itemId} className="flex justify-between text-sm">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">₹{order.total}</span>
            </div>
            {order.deliveryDetails && (
              <>
                <Separator className="my-3" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold">Delivery to:</p>
                  <p>{order.deliveryDetails.name}</p>
                  <p className="text-muted-foreground">
                    {order.deliveryDetails.department},{" "}
                    {order.deliveryDetails.year}
                  </p>
                  <p className="text-muted-foreground">
                    {order.deliveryDetails.floor} •{" "}
                    {order.deliveryDetails.phone}
                  </p>
                </div>
              </>
            )}
          </div>

          <Button
            className="w-full h-12 rounded-xl font-semibold"
            onClick={() => navigate("home")}
            data-ocid="order.primary_button"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </>
  );
}
