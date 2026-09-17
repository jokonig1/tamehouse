export default function EmbedBox({
  url,
  tipo,
  titulo,
}: {
  url: string | null;
  tipo: "spotify" | "video";
  titulo: string;
}) {
  if (!url) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 py-8">
        <p className="text-sm text-white/50">Próximamente</p>
      </div>
    );
  }

  if (tipo === "spotify") {
    return (
      <iframe
        src={url}
        title={titulo}
        className="h-[152px] w-full rounded-lg"
        allow="encrypted-media"
        loading="lazy"
      />
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        src={url}
        title={titulo}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
