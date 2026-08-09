import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/components/layout/nav-items";

/** ⌘K / Ctrl+K palette for fast travel across the learning world. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search missions, worlds, practice…" />
      <CommandList>
        <CommandEmpty>Nothing matches that yet.</CommandEmpty>
        <CommandGroup heading="Go to">
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.to}
              value={item.label}
              onSelect={() => {
                setOpen(false);
                navigate({ to: item.to });
              }}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
