"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { User, CreditCard, LogOut, Settings } from "lucide-react";

export function UserNav({ user }: { user: { name?: string | null; email?: string | null; image?: string | null } }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="relative size-8 rounded-full overflow-hidden border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all">
          {user.image ? (
            <img src={user.image} alt={user.name ?? "Avatar"} className="size-full object-cover" />
          ) : (
            <div className="size-full bg-muted flex items-center justify-center font-medium text-xs text-muted-foreground uppercase">
              {user.name?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
            </div>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-56 p-1 rounded-xl shadow-lg border border-border bg-card text-card-foreground transform origin-top-right transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
          align="end"
          sideOffset={8}
        >
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
          </div>
          
          <DropdownMenu.Separator className="h-px bg-border my-1 -mx-1" />

          <DropdownMenu.Item asChild className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
            <Link href="/profile">
              <User className="mr-2 size-4" />
              <span>Profile Manager</span>
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
            <Link href="/pro">
              <CreditCard className="mr-2 size-4" />
              <span>Subscription Manage</span>
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-border my-1 -mx-1" />

          <DropdownMenu.Item
            onClick={() => signOut({ callbackUrl: "/" })}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
          >
            <LogOut className="mr-2 size-4" />
            <span>Sign out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
