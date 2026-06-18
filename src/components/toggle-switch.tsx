interface ToggleSwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="relative inline-block cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className="flex items-center w-[44px] h-[24px] rounded-full transition-colors duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-400"
        style={{ backgroundColor: checked ? "rgb(113, 113, 122)" : "rgb(63, 63, 70)" }}
      >
        <div
          className="w-[18px] h-[18px] rounded-full bg-white transition-transform duration-300 shadow-md"
          style={{ transform: checked ? "translateX(23px)" : "translateX(3px)" }}
        />
      </div>
    </label>
  );
}
