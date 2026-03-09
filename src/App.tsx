import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import AppSidebar from "@/components/AppSidebar";
import MobileNav from "@/components/MobileNav";
import Dashboard from "@/pages/Dashboard";
import TableBoard from "@/pages/TableBoard";
import EmployeeList from "@/pages/EmployeeList";
import EmployeeProfile from "@/pages/EmployeeProfile";
import GoalEntry from "@/pages/GoalEntry";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="flex-1 p-6 md:p-8 pb-20 md:pb-8 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/board" element={<TableBoard />} />
                <Route path="/employees" element={<EmployeeList />} />
                <Route path="/employees/:id" element={<EmployeeProfile />} />
                <Route path="/goals/new" element={<GoalEntry />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <MobileNav />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
