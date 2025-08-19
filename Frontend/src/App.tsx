import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Index from "./pages/Index";
import { About } from "./pages/About";
import { Services } from "./pages/Services";
import { StaffStatus } from "./pages/StaffStatus";
import { Complaints } from "./pages/Complaints";
import { Broadcasts } from "./pages/Broadcasts";
import { Events } from "./pages/Events";
import { Queue } from "./pages/Queue";
import { Analytics } from "./pages/Analytics";
import { Login } from "./pages/Login";
import { MyApplications } from "./pages/MyApplications";
import { DigitalLocker } from "./pages/DigitalLocker";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="my-applications" element={<MyApplications />} />
            <Route path="digital-locker" element={<DigitalLocker />} />
            <Route path="staff-status" element={<StaffStatus />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="broadcasts" element={<Broadcasts />} />
            <Route path="events" element={<Events />} />
            <Route path="queue" element={<Queue />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
