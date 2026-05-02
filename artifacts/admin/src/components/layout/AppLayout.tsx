import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar className="border-r border-slate-200">
          <SidebarHeader className="h-16 px-6 flex items-center border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xl text-primary">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">X</div>
              XomoGambia
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard"}
                  className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                >
                  <Link href="/dashboard" className="flex items-center gap-3 w-full p-2 rounded-md">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.startsWith("/providers")}
                  className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                >
                  <Link href="/providers" className="flex items-center gap-3 w-full p-2 rounded-md">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Providers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1 flex flex-col min-w-0">
          <div className="h-16 border-b border-slate-200 bg-white flex items-center px-8 shrink-0 shadow-sm">
            <h1 className="font-semibold text-lg text-slate-800">Admin Portal</h1>
          </div>
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}