import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";

import PageLayout from "@/components/layout/PageLayout";
import Home from "@/pages/Home";
import Classes from "@/pages/Classes";
import Trainers from "@/pages/Trainers";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import Portal from "@/pages/Portal";
import Shop from "@/pages/Shop";
import Challenge from "@/pages/Challenge";
import Admin from "@/pages/Admin";
import MemberDetail from "@/pages/MemberDetail";
import Join from "@/pages/Join";
import CheckoutReturn from "@/pages/CheckoutReturn";
import TrainerBookings from "@/pages/TrainerBookings";
import TrainerPortal from "@/pages/TrainerPortal";
import EmployeePortal from "@/pages/EmployeePortal";
import Login from "@/pages/Login";
import Gallery from "@/pages/Gallery";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    } else if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/challenge" element={<Challenge />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/member/:id" element={<MemberDetail />} />
        <Route path="/checkout/return" element={<CheckoutReturn />} />
        <Route path="/trainer-bookings" element={<TrainerBookings />} />
      <Route path="/trainer-portal" element={<TrainerPortal />} />
      <Route path="/employee-portal" element={<EmployeePortal />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;