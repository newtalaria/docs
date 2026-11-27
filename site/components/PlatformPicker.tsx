import { platforms } from "@/lib/platforms";

export function PlatformPicker() {
  return (
    <div className="picker" role="list">
      {platforms.map((p) => (
        <a key={p.id} href={`${p.href}?platform=${p.id}`} role="listitem">
          <b>{p.title}</b>
          {p.family && p.family !== p.title ? <span>{p.family}</span> : null}
        </a>
      ))}
    </div>
  );
}
