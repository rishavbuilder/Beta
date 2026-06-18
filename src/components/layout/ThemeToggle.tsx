import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored === "dark" || !stored;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="grid size-8 place-items-center rounded-lg border border-white/10 bg-zinc-900/60 text-zinc-400 transition-colors hover:text-zinc-100"
      aria-label="Toggle theme"
    >
      {!mounted ? (
        <Moon className="size-3.5 opacity-50" />
      ) : dark ? (
        <Sun className="size-3.5" />
      ) : (
        <Moon className="size-3.5" />
      )}
    </button>
  );
}
