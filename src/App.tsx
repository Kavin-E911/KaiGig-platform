import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DashboardPage from "@/pages/DashboardPage";
import PostGigPage from "@/pages/PostGigPage";
import ViewGigsPage from "@/pages/ViewGigsPage";
import ApplyGigPage from "@/pages/ApplyGigPage";
import MyApplicationsPage from "@/pages/MyApplicationsPage";
import MyGigsPage from "@/pages/MyGigsPage";
import ManageGigPage from "@/pages/ManageGigPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SubmitDeliverablePage from "@/pages/SubmitDeliverablePage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/post-gig" element={<PostGigPage />} />
            <Route path="/gigs" element={<ViewGigsPage />} />
            <Route path="/apply/:id" element={<ApplyGigPage />} />
            <Route path="/my-applications" element={<MyApplicationsPage />} />
            <Route path="/my-gigs" element={<MyGigsPage />} />
            <Route path="/manage-gig/:id" element={<ManageGigPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/submit-deliverable/:id" element={<SubmitDeliverablePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
