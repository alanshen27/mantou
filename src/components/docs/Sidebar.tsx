"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarLink {
  slug: string;
  title: string;
  href: string;
}

export interface SidebarGroup {
  group: string;
  links: SidebarLink[];
}

export function Sidebar({ groups }: { groups: SidebarGroup[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-7">
      {groups.map((group) => (
        <div key={group.group}>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-[#a89b82]">
            {group.group}
          </p>
          <ul className="space-y-0.5">
            {group.links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block rounded-lg px-3 py-1.5 text-sm transition ${
                      active
                        ? "bg-[#3a2a20] font-semibold text-[#fbf4e6]"
                        : "text-[#6b5a48] hover:bg-[#efe6d2] hover:text-[#3a2a20]"
                    }`}
                  >
                    {link.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
