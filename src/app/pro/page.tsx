import AppNav from "../components/AppNav";
import { ProContent } from "./ProContent";
import { auth } from "../../auth";

export default async function ProPage() {
  const session = await auth();

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <AppNav links={[{ label: "Pro", href: "/pro", active: true }]} />
      <ProContent isAuthenticated={!!session?.user} />
    </div>
  );
}
