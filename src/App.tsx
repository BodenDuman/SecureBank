import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RequestStoreProvider } from "@/store/requestStore";
import { LLMProvider } from "@/store/llmStore";
import CustomerPortal from "./pages/CustomerPortal";
import ManagerDashboard from "./pages/ManagerDashboard";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LLMProvider>
        <RequestStoreProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<CustomerPortal />} />
              <Route path="/dashboard" element={<ManagerDashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RequestStoreProvider>
      </LLMProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
