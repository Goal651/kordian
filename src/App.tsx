import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GitHubAppProvider } from "./hooks/useGitHubAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Security from "./pages/Security";
import Members from "./pages/Members";
import Repositories from "./pages/Repositories";
import Compliance from "./pages/Compliance";
import AuthCallback from "./pages/AuthCallback";
import SelectOrg from "./pages/SelectOrg";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GitHubAppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/connect" element={<Index />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/select-org" element={<SelectOrg />} />
            <Route path="/security" element={<Security />} />
            <Route path="/members" element={<Members />} />
            <Route path="/repos" element={<Repositories />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GitHubAppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
