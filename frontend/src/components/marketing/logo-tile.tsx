interface LogoTileProps {
  name: string;
}

export function LogoTile({ name }: LogoTileProps) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs uppercase text-emerald-700">
        {name.slice(0, 2)}
      </span>
      <span className="text-gray-900">{name}</span>
    </div>
  );
}
