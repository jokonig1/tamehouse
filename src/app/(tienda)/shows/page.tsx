import ShowCard from "@/components/ShowCard";
import { getProximosShows } from "@/lib/shows";

export default async function Page() {
  const shows = await getProximosShows();

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <span className="text-xs font-medium tracking-[0.3em] text-white/50 uppercase">
          Próximas fechas
        </span>
        <h1 className="mt-2 text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
          Shows
        </h1>
      </div>

      {shows.length === 0 ? (
        <p className="mx-auto max-w-6xl px-6 pb-12 text-sm text-white/60">Sin fechas por ahora.</p>
      ) : (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-16">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      )}
    </div>
  );
}
