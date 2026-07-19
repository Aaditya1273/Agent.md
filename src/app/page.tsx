import Link from "next/link";
import AppNav from "./components/AppNav";
import { getModels } from "./lib/data";

export default async function HomePage() {
  const models = getModels();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <AppNav links={[{ label: "Models", href: "/", active: true }, { label: "Registry", href: "/" }]} />
      <main className="max-w-7xl mx-auto px-6 pt-24 sm:pt-32 pb-24">
        <div className="mb-16">
          <span className="font-mono text-xs text-primary uppercase tracking-[0.24em]">§ Step 01</span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">
            Choose AI Model
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-[54ch]">
            Select your primary inference engine to see available domains and engineering presets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {models.map((model) => (
            <Link
              key={model.id}
              href={`/models/${model.id}`}
              className="group relative flex flex-col justify-between p-6 h-48 border border-border rounded-xl hover:border-primary/50 bg-muted/10 hover:bg-muted/30 transition-all overflow-hidden"
            >
              <div className="z-10 flex flex-col items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={model.logo} alt={model.name} className="w-10 h-10 object-contain rounded-md" />
                <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                  {model.name}
                </h3>
              </div>
              <div className="z-10 mt-auto font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                <span>Select</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </Link>
          ))}
          {models.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
              No models found in the registry.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

