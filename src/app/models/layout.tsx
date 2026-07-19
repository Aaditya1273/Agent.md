import { redirect } from "next/navigation";
import { auth } from "../../auth";

export default async function ModelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex-1 w-full">{children}</div>;
}
