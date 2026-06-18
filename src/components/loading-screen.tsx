const words = ["buttons", "forms", "switches", "cards", "buttons"];

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111]">
      <div className="flex items-center gap-2 rounded-2xl bg-[#111] px-8 py-4">
        <div className="flex h-10 items-center gap-1 rounded-lg p-[10px] text-[25px] font-medium text-zinc-500">
          <span>loading</span>
          <div className="relative overflow-hidden">
            <div
              className="absolute inset-0 z-20"
              style={{
                background: "linear-gradient(#111 10%, transparent 30%, transparent 70%, #111 90%)",
              }}
            />
            <div className="relative" style={{ animation: "loadSpin 4s infinite" }}>
              {words.map((w, i) => (
                <span key={i} className="block h-full pl-[6px] text-[#956afa]">
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes loadSpin {
          0%   { transform: translateY(0); }
          10%  { transform: translateY(-102%); }
          25%  { transform: translateY(-100%); }
          35%  { transform: translateY(-202%); }
          50%  { transform: translateY(-200%); }
          60%  { transform: translateY(-302%); }
          75%  { transform: translateY(-300%); }
          85%  { transform: translateY(-402%); }
          100% { transform: translateY(-400%); }
        }
      `}</style>
    </div>
  );
}
