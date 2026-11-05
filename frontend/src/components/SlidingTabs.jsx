// src/components/SlidingTabs.jsx
// Reusable animated tab/filter pill selector with smooth sliding indicator.
import { useRef, useEffect, useState } from "react";

/**
 * SlidingTabs — animated horizontal pill switcher.
 *
 * Props:
 *  - tabs:    [{ key, label, icon?: LucideComponent, count?: number }]
 *  - value:   currently active key (string)
 *  - onChange: (key) => void
 *  - className?: extra wrapper class
 *  - iconSize?: icon pixel size (default 14)
 *  - size?: "sm" | "md" (default "md" — changes padding)
 */
export default function SlidingTabs({
  tabs,
  value,
  onChange,
  className = "",
  iconSize = 14,
  size = "md",
}) {
  const containerRef = useRef(null);
  const buttonRefs = useRef([]);
  const [pillStyle, setPillStyle] = useState({ width: 0, left: 0, opacity: 0 });

  // Update pill position whenever active tab changes or on mount.
  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.key === value);
    const btn = buttonRefs.current[activeIndex];
    const container = containerRef.current;
    if (!btn || !container) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    setPillStyle({
      width: btnRect.width,
      left: btnRect.left - containerRect.left,
      opacity: 1,
    });
  }, [value, tabs]);

  const px = size === "sm" ? "px-3 py-1.5" : "px-3.5 py-2";
  const textSize = "text-xs";

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto no-scrollbar ${className}`}
    >
      {/* Sliding white pill indicator */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1.5 bottom-1.5 rounded-xl bg-white border border-slate-200/70 shadow-xs transition-all duration-300 ease-in-out"
        style={{
          width: pillStyle.width,
          transform: `translateX(${pillStyle.left}px)`,
          opacity: pillStyle.opacity,
        }}
      />

      {tabs.map(({ key, label, icon: Icon, count }, i) => {
        const isActive = value === key;
        return (
          <button
            key={key}
            ref={(el) => (buttonRefs.current[i] = el)}
            type="button"
            onClick={() => onChange(key)}
            className={[
              "relative z-10 flex items-center gap-1.5 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-colors duration-200",
              textSize,
              px,
              isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-800",
            ].join(" ")}
          >
            {Icon && (
              <Icon
                size={iconSize}
                className={
                  isActive
                    ? "text-amber-500 transition-colors duration-200"
                    : "text-slate-400 transition-colors duration-200"
                }
              />
            )}
            <span>{label}</span>
            {count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold transition-colors duration-200 ${
                  isActive
                    ? "bg-amber-100/80 text-amber-800"
                    : "bg-slate-200/70 text-slate-600"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

