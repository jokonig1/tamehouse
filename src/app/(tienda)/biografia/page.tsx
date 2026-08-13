const FASES = [
  {
    year: "2018",
    titulo: "Los inicios",
    texto:
      "Primeras canciones grabadas en casa y los primeros shows en bares pequeños, buscando un sonido propio.",
    fondo:
      "radial-gradient(circle at 25% 30%, rgba(168,85,247,0.35), transparent 45%), radial-gradient(circle at 75% 70%, rgba(56,189,248,0.25), transparent 55%), linear-gradient(180deg, #050505 0%, #0a0a0f 60%, #000 100%)",
  },
  {
    year: "2021",
    titulo: "El quiebre",
    texto:
      "El primer álbum y una gira que llenó salas medianas por primera vez. El proyecto empezó a tomar forma propia.",
    fondo:
      "radial-gradient(circle at 70% 25%, rgba(244,63,94,0.35), transparent 45%), radial-gradient(circle at 30% 75%, rgba(234,179,8,0.2), transparent 55%), linear-gradient(180deg, #050505 0%, #0a0a0f 60%, #000 100%)",
  },
  {
    year: "2023",
    titulo: "La consagración",
    texto:
      "Estadios llenos y el reconocimiento del público masivo. La música empezó a viajar más allá de las fronteras.",
    fondo:
      "radial-gradient(circle at 20% 70%, rgba(34,197,94,0.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(56,189,248,0.3), transparent 50%), linear-gradient(180deg, #050505 0%, #0a0a0f 60%, #000 100%)",
  },
  {
    year: "2026",
    titulo: "Hoy",
    texto:
      "Una nueva era, nueva música y una tienda oficial para quienes acompañan el proyecto desde siempre.",
    fondo:
      "radial-gradient(circle at 50% 30%, rgba(168,85,247,0.3), transparent 45%), radial-gradient(circle at 50% 80%, rgba(244,63,94,0.25), transparent 55%), linear-gradient(180deg, #050505 0%, #0a0a0f 60%, #000 100%)",
  },
];

export default function Page() {
  return (
    <div className="h-[calc(100vh-5rem)] snap-y snap-mandatory overflow-y-scroll bg-black text-white">
      {FASES.map((fase) => (
        <section
          key={fase.year}
          className="relative flex h-full w-full snap-start flex-col justify-end overflow-hidden"
        >
          <div className="absolute inset-0" style={{ background: fase.fondo }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          <div className="relative mx-auto w-full max-w-6xl px-6 pb-16">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/70">
              {fase.year}
            </span>
            <h2 className="mt-4 text-5xl font-extrabold uppercase tracking-tight sm:text-6xl">
              {fase.titulo}
            </h2>
            <p className="mt-4 max-w-xl text-white/80">{fase.texto}</p>
          </div>
        </section>
      ))}
    </div>
  );
}
