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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/Documents";
import Tracking from "@/pages/Tracking";
import Finance from "@/pages/Finance";
import Transactions from "@/pages/Transactions";
import CreateDocument from "@/pages/CreateDocument";
import NotFound from "@/pages/not-found";

// Insurance pages
import InsuranceDashboard from "@/pages/insurance/InsuranceDashboard";
import CreatePolicy from "@/pages/insurance/CreatePolicy";
import ClaimsManagement from "@/pages/insurance/ClaimsManagement";

// Customs pages
import CustomsDashboard from "@/pages/customs/CustomsDashboard";
import ClearanceReview from "@/pages/customs/ClearanceReview";

// Port Authority pages
import PortDashboard from "@/pages/port/PortDashboard";
import CreateOperation from "@/pages/port/CreateOperation";

// Freight Forwarder pages
import ForwarderDashboard from "@/pages/forwarder/ForwarderDashboard";
import CreateCoordination from "@/pages/forwarder/CreateCoordination";

function Router({ currentRole }: { currentRole: string }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

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
      
      {/* Insurance routes */}
      <Route path="/insurance" component={InsuranceDashboard} />
      <Route path="/insurance/policies/new" component={CreatePolicy} />
      <Route path="/insurance/claims" component={ClaimsManagement} />
      
      {/* Customs routes */}
      <Route path="/customs" component={CustomsDashboard} />
      <Route path="/customs/clearances" component={ClearanceReview} />
      
      {/* Port Authority routes */}
      <Route path="/port" component={PortDashboard} />
      <Route path="/port/operations/new" component={CreateOperation} />
      
      {/* Freight Forwarder routes */}
      <Route path="/forwarder" component={ForwarderDashboard} />
      <Route path="/forwarder/coordination/new" component={CreateCoordination} />
      
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
        <AuthWrapper 
          currentRole={currentRole} 
          setCurrentRole={setCurrentRole}
          sidebarStyle={sidebarStyle}
        />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AuthWrapper({ 
  currentRole, 
  setCurrentRole, 
  sidebarStyle 
}: { 
  currentRole: string; 
  setCurrentRole: (role: string) => void;
  sidebarStyle: Record<string, string>;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return <Router currentRole={currentRole} />;
  }

  return (
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
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Router currentRole={currentRole} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function UserMenu() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.email || 'User';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger data-testid="button-user-menu">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.profileImageUrl || undefined} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">{displayName}</div>
            {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
            {user.company && <div className="text-xs text-muted-foreground">{user.company}</div>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/api/logout" className="flex items-center gap-2" data-testid="button-logout">
            <LogOut className="h-4 w-4" />
            Logout
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default App;
