import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import StakeholderSelector from "@/components/StakeholderSelector";
import BlockchainStatus from "@/components/BlockchainStatus";
import { useState } from "react";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/Documents";
import Tracking from "@/pages/Tracking";
import Finance from "@/pages/Finance";
import Transactions from "@/pages/Transactions";
import CreateDocument from "@/pages/CreateDocument";
import NotFound from "@/pages/not-found";

function Router({ currentRole }: { currentRole: string }) {
  return (
    <Switch>
      <Route path="/">
        {() => <Dashboard currentRole={currentRole} />}
      </Route>
      <Route path="/documents" component={Documents} />
      <Route path="/tracking" component={Tracking} />
      <Route path="/finance" component={Finance} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/create" component={CreateDocument} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [currentRole, setCurrentRole] = useState('shipper');
  
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
                <div className="flex items-center gap-3">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="hidden md:block">
                    <BlockchainStatus compact />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StakeholderSelector 
                    currentRole={currentRole} 
                    onRoleChange={setCurrentRole} 
                  />
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto p-6">
                <Router currentRole={currentRole} />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
