"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ChartBar,
  Banknote,
  Users,
  Fingerprint,
  TableOfContents,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Default",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        title: "CRM",
        url: "/dashboard/crm",
        icon: ChartBar,
      },
      {
        title: "Finance",
        url: "/dashboard/finance",
        icon: Banknote,
      },
    ],
  },
  {
    id: 2,
    label: "Pages",
    items: [
      {
        title: "User Management",
        url: "/auth",
        icon: Fingerprint,
        subItems: [
          { title: "Platform User", url: "/dashboard/platform-users", icon: Users },
          { title: "Admin User", url: "/dashboard/admin-users", icon: Users },
        ],
      },
      {
        title: "Content Management",
        url: "/auth",
        icon: TableOfContents,
        subItems: [
          { title: "Decks", url: "/dashboard/Decks", icon: CreditCard },
          { title: "Categories", url: "/dashboard/Categories", icon: CreditCard },
          { title: "Cards", url: "/dashboard/Card-Contents", icon: CreditCard },
        ],
      },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6 px-2 py-4 text-sm">
      {sidebarItems.map((group) => (
        <div key={group.id} className="space-y-2">
          {group.items.map((item) => (
            <div key={item.title}>
              <div className="text-muted-foreground px-3 text-xs font-semibold">{item.title}</div>
              {item.subItems && (
                <div className="mt-1 space-y-1">
                  {item.subItems.map((sub) => {
                    const isActive = pathname === sub.url;
                    return (
                      <Link
                        key={sub.title}
                        href={sub.url}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 transition-all",
                          isActive
                            ? "bg-muted text-primary font-medium"
                            : "hover:bg-muted hover:text-foreground text-muted-foreground",
                        )}
                      >
                        {sub.icon && <sub.icon className="text-muted-foreground h-4 w-4" />}
                        <span>{sub.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}
