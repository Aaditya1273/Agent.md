import Link from "next/link";
import AppNav from "../../../../components/AppNav";
import CopyButton from "../../../../components/CopyButton";
import { getPresetsForWork } from "../../../../lib/data";
import { Terminal } from "lucide-react";

export default async function WorkPage({
  params,
}: {
  params: Promise<{ model: string; work: string }>;
}) {
  const { model, work } = await params;
  const presets = getPresetsForWork(model, work);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <AppNav links={[
        { label: "Models", href: "/" },
        { label: "Domain", href: `/models/${model}` },
        { label: "Style", href: `/models/${model}/work/${work}`, active: true },
      ]} />
      <main className="max-w-7xl mx-auto px-6 pt-24 sm:pt-32 pb-24">
        <div className="mb-16">
          <span className="font-mono text-xs text-primary uppercase tracking-[0.24em]">§ Step 03</span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight capitalize">
            Choose Style / Preset
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-[54ch]">
            Select a specific standard or design language for {work.replace("-", " ")}.
          </p>

          {/* CLI install strip */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-mono"
            style={{ background: "color-mix(in oklab, var(--primary) 7%, var(--background))", border: "1px solid color-mix(in oklab, var(--primary) 18%, transparent)" }}>
            <Terminal className="w-4 h-4 shrink-0" style={{ color: "var(--primary)" }} />
            <span className="text-foreground">
              <span style={{ color: "var(--primary)", fontWeight: 600 }}>npx</span>{" "}
              agentmd-cli install {model}/{work}/
            </span>
            <CopyButton text={`npx agentmd-cli install ${model}/${work}/`} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {presets.map((preset) => (
            <Link
              key={preset.id}
              href={`/models/${model}/work/${work}/preset/${preset.id}`}
              className="group flex flex-col justify-between p-5 h-32 border border-border rounded-xl hover:border-foreground/40 bg-muted/5 hover:bg-muted/20 transition-all overflow-hidden"
            >
              <div className="z-10">
                <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
                  {preset.name}
                </h3>
              </div>
              <div className="z-10 mt-auto font-mono text-[10px] text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                <span>Select</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </Link>
          ))}
          {presets.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
              No presets found for this domain.
            </div>
          )}
        </div>
        
        <div className="mt-12">
          <Link href={`/models/${model}`} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Domains
          </Link>
        </div>
      </main>
    </div>
  );
}

