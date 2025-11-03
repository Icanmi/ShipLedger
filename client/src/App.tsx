import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import ShipperView from "@/pages/ShipperView";
import CarrierView from "@/pages/CarrierView";
import BlockchainExplorer from "@/pages/BlockchainExplorer";
import { useAuth } from "@/hooks/useAuth";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function AuthenticatedApp() {
  const { user } = useAuth();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const renderView = () => {
    if (!user) return <Dashboard />;
    
    switch (user.role) {
      case "shipper":
        return <ShipperView />;
      case "carrier":
        return <CarrierView />;
      case "customs":
      case "port":
        return <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b flex-wrap">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Role:</span>
                <Badge variant="outline" data-testid="badge-user-role">
                  {user?.role || "Loading..."}
                </Badge>
                {user?.companyName && (
                  <span className="text-sm text-muted-foreground">
                    {user.companyName}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                data-testid="button-notifications"
                onClick={() => console.log('Notifications clicked')}
              >
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Switch>
              <Route path="/" component={() => renderView()} />
              <Route path="/shipments" component={Dashboard} />
              <Route path="/documents" component={Dashboard} />
              <Route path="/tracking" component={Dashboard} />
              <Route path="/blockchain" component={BlockchainExplorer} />
              <Route path="/settings" component={Dashboard} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route component={AuthenticatedApp} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
