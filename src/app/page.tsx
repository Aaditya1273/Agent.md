import AppNav from "./components/AppNav";
import { ModelGrid } from "./components/ModelGrid";
import { getModels } from "./lib/data";
import { auth } from "../auth";

export default async function HomePage() {
  const models = getModels();
  const session = await auth();

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
          <ModelGrid models={models} isAuthenticated={!!session?.user} />
        </div>
      </main>
    </div>
  );
}
