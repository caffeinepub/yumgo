import { useEffect, useState } from "react";

interface Props {
  onDone: () => void;
}

const FOOD_EMOJIS = ["🍛", "🍜", "🥗", "🍱", "🧆", "🥙", "🍔", "🍕"];
const DURATION = 5;

export default function WelcomePage({ onDone }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setFadeOut(true);
          setTimeout(onDone, 600);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onDone]);

  const radius = 26;
  const circ = 2 * Math.PI * radius;
  const progress = ((DURATION - secondsLeft) / DURATION) * circ;

  function skip() {
    setFadeOut(true);
    setTimeout(onDone, 400);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-16 px-6 transition-opacity duration-700 relative"
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

      {/* Logo area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div
          className="rounded-3xl p-8 shadow-2xl w-full max-w-xs flex flex-col items-center"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <img
            src="/assets/generated/welcome-logo-cropped.png"
            alt="YumGo"
            className="w-44 h-auto object-contain mb-6"
          />
          <h1
            className="text-center font-bold text-3xl leading-snug"
            style={{ color: "#2d6a4f", fontFamily: "Georgia, serif" }}
          >
            Where Every Bite Tells a Story
          </h1>
        </div>
      </div>

      {/* Countdown ring + skip */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <svg
            width="68"
            height="68"
            className="-rotate-90"
            role="img"
            aria-label={`${secondsLeft} seconds remaining`}
          >
            <circle
              cx="34"
              cy="34"
              r={radius}
              fill="none"
              stroke="#c8d8c4"
              strokeWidth="5"
            />
            <circle
              cx="34"
              cy="34"
              r={radius}
              fill="none"
              stroke="#2d6a4f"
              strokeWidth="5"
              strokeDasharray={circ}
              strokeDashoffset={circ - progress}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
        </div>
        <button
          type="button"
          onClick={skip}
          className="text-sm font-medium px-6 py-2 rounded-full border"
          style={{
            borderColor: "#2d6a4f",
            color: "#2d6a4f",
            background: "transparent",
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
