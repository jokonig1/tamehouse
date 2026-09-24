import ShowList from "@/components/ShowList";
import { getProximosShows } from "@/lib/shows";

export default async function Page() {
  const shows = await getProximosShows();

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-black text-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <span className="text-xs font-medium tracking-[0.3em] text-white/50 uppercase">
          Próximas fechas
        </span>
        <h1 className="mt-2 text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
          Shows
        </h1>

        <div className="mt-10">
          <ShowList shows={shows} variant="dark" />
        </div>
      </div>
    </div>
  );
}
