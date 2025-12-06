interface LogoTileProps {
  name: string;
}

export function LogoTile({ name }: LogoTileProps) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-100 shadow-inner shadow-black/20">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs uppercase text-emerald-200">
        {name.slice(0, 2)}
      </span>
      <span className="text-slate-200">{name}</span>
    </div>
  );
}
