import Link from "next/link";
import AppNav from "../../components/AppNav";
import { getWorksForModel } from "../../lib/data";

// Since it's a dynamic route based on filesystem, Next.js needs this config or we can just use dynamic params.
export default async function ModelPage({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model } = await params;
  const works = getWorksForModel(model);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <AppNav links={[
        { label: "Models", href: "/" },
        { label: "Domain", href: `/models/${model}`, active: true },
      ]} />
      <main className="max-w-7xl mx-auto px-6 pt-24 sm:pt-32 pb-24">
        <div className="mb-16">
          <span className="font-mono text-xs text-primary uppercase tracking-[0.24em]">§ Step 02</span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight capitalize">
            Choose Domain for {model.replace("-", " ")}
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-[54ch]">
            Select the specific engineering domain or workflow you are building.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {works.map((work) => (
            <Link
              key={work.id}
              href={`/models/${model}/work/${work.id}`}
              className="group relative flex flex-col justify-between p-6 h-40 border border-border rounded-xl hover:border-primary/50 bg-muted/10 hover:bg-muted/30 transition-all overflow-hidden"
            >
              <div className="z-10">
                <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                  {work.name}
                </h3>
              </div>
              <div className="z-10 mt-auto font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                <span>Select</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </Link>
          ))}
          {works.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
              No domains found for this model.
            </div>
          )}
        </div>
        
        <div className="mt-12">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Models
          </Link>
        </div>
      </main>
    </div>
  );
}

