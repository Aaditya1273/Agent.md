"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";

interface Model {
  id: string;
  name: string;
  logo: string;
}

export function ModelGrid({
  models,
  isAuthenticated,
}: {
  models: Model[];
  isAuthenticated: boolean;
}) {
  if (models.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
        No models found in the registry.
      </div>
    );
  }

  return (
    <>
      {models.map((model) => {
        const card = (
          <div className="group relative flex flex-col justify-between p-6 h-48 border border-border rounded-xl hover:border-primary/50 bg-muted/10 hover:bg-muted/30 transition-all overflow-hidden cursor-pointer">
            <div className="z-10 flex flex-col items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={model.logo}
                alt={model.name}
                className="w-10 h-10 object-contain rounded-md"
              />
              <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                {model.name}
              </h3>
            </div>
            <div className="z-10 mt-auto font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center justify-between">
              <span>Select</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </div>
        );

        // Authenticated — navigate directly
        if (isAuthenticated) {
          return (
            <Link key={model.id} href={`/models/${model.id}`}>
              {card}
            </Link>
          );
        }

        // Unauthenticated — trigger Google OAuth directly, redirect to model after sign-in
        return (
          <div
            key={model.id}
            onClick={() =>
              signIn("google", { callbackUrl: `/models/${model.id}` })
            }
          >
            {card}
          </div>
        );
      })}
    </>
  );
}
