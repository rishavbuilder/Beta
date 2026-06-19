import { Link } from "@tanstack/react-router";
import { Github, Twitter } from "lucide-react";
import logoSrc from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logoSrc} alt="PromptOS" className="size-13 rounded" />
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              The precision layer for creative intelligence. Discover, version, and deploy
              high-performance prompts.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Platform
            </h4>
            <div className="flex flex-col gap-2">
              <Link to="/explore" className="text-xs text-zinc-500 hover:text-zinc-200">
                Marketplace
              </Link>
              <Link to="/categories" className="text-xs text-zinc-500 hover:text-zinc-200">
                Categories
              </Link>
              <Link to="/optimizer" className="text-xs text-zinc-500 hover:text-zinc-200">
                Prompt Optimizer
              </Link>
              <Link to="/lab" className="text-xs text-zinc-500 hover:text-zinc-200">
                Testing Lab
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Community
            </h4>
            <div className="flex flex-col gap-2">
              <Link to="/community" className="text-xs text-zinc-500 hover:text-zinc-200">
                Discussions
              </Link>
              <Link to="/battle" className="text-xs text-zinc-500 hover:text-zinc-200">
                Prompt Battles
              </Link>
              <Link to="/battle/leaderboard" className="text-xs text-zinc-500 hover:text-zinc-200">
                Leaderboard
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Legal
            </h4>
            <div className="flex flex-col gap-2">
              <Link to="/privacy" className="text-xs text-zinc-500 hover:text-zinc-200">
                Privacy
              </Link>
              <Link to="/terms" className="text-xs text-zinc-500 hover:text-zinc-200">
                Terms
              </Link>
              <Link to="/security" className="text-xs text-zinc-500 hover:text-zinc-200">
                Security
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <span className="text-xs text-zinc-600">
            © {new Date().getFullYear()} PromptOS Labs. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-zinc-500 hover:text-zinc-200"
            >
              <Twitter className="size-4" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-zinc-500 hover:text-zinc-200"
            >
              <Github className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
