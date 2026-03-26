import { useEffect, useState } from "react";

interface Props {
  onDone: () => void;
}

const FOOD_EMOJIS = ["🍛", "🍜", "🥗", "🍱", "🧆", "🥙", "🍔", "🍕"];
const DURATION = 5;

export default function WelcomePage({ onDone }: Props) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onDone, 600);
    }, DURATION * 1000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-16 px-6 transition-opacity duration-700 relative"
      style={{
        background:
          "linear-gradient(160deg, #f5f5f0 0%, #e8ede6 60%, #d4dfd2 100%)",
        opacity: fadeOut ? 0 : 1,
      }}
    >
      {/* Floating food emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {FOOD_EMOJIS.map((e) => (
          <span
            key={e}
            className="absolute text-3xl animate-float select-none"
            style={{
              left: `${10 + FOOD_EMOJIS.indexOf(e) * 11}%`,
              top: `${5 + (FOOD_EMOJIS.indexOf(e) % 3) * 28}%`,
              animationDelay: `${FOOD_EMOJIS.indexOf(e) * 0.4}s`,
              animationDuration: `${3 + (FOOD_EMOJIS.indexOf(e) % 3)}s`,
              opacity: 0.18,
            }}
          >
            {e}
          </span>
        ))}
      </div>

      {/* Logo only — tagline is part of the logo image */}
      <div className="flex flex-col items-center justify-center w-full">
        <img
          src="/assets/generated/welcome-logo-cropped.png"
          alt="YumGo"
          className="w-64 h-auto object-contain"
        />
      </div>
    </div>
  );
}
