import { AppLayout } from "@/components/AppLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import ResetPasswordForm from "./components/ResetPasswordForm.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminListingsPage from "./pages/admin/Listings";
import AdminSettings from "./pages/admin/Settings";
import AdminUsers from "./pages/admin/Users";
import AdminVerify from "./pages/admin/Verification";
import Index from "./pages/Index";
import InstallIOS from "./pages/InstallIOS";
import ListingDetail from "./pages/ListingDetail";
import Listings from "./pages/Listings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound.tsx";
import Profile from "./pages/Profile";
import Saved from "./pages/Saved";
import CreateListing from "./pages/seller-dashboard/CreateListing";
import ManageListings from "./pages/seller-dashboard/ManageListings";
import OnbApply from "./pages/seller-onboarding/Apply";
import OnbFaceScan from "./pages/seller-onboarding/FaceScan.tsx";
import OnbIntro from "./pages/seller-onboarding/Intro";
import OnbPending from "./pages/seller-onboarding/Pending";
import OnbStoreProfile from "./pages/seller-onboarding/StoreProfile";
import SellerProfile from "./pages/SellerProfile";
import Signup from "./pages/Signup";
import Support from "./pages/Support";
import VerifyEmail from "./pages/VerifyEmail";
import Forgot from "./pages/forgot.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AuthSuccess from "./pages/AuthSucces.tsx";
import VerificationDetailPage from "./pages/admin/VerificationDetailPage.tsx";
import UserDetailPage from "./pages/admin/UserDetailPage.tsx";
import CategoryListPage from "./pages/admin/CategoryListPage.tsx";
import CategoryDetailPage from "./pages/admin/CategoryDetailPage..tsx";
import CategoryForm from "./pages/admin/CategoryForm.tsx";
import ProductDetailPage from "./pages/seller-dashboard/ProductDetailPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />

              <Route path="/saved" element={<Saved />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/success" element={<AuthSuccess />} />
              <Route path="/forgot" element={<Forgot />} />
              <Route path="/reset-password" element={<ResetPasswordForm />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/support" element={<Support />} />
              <Route path="/install-ios" element={<InstallIOS />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Outlet />
                  </ProtectedRoute>
                }
              >
                <Route path="/seller-onboarding/intro" element={<OnbIntro />} />
                <Route path="/seller-onboarding/apply" element={<OnbApply />} />
                <Route
                  path="/seller-onboarding/face-scan"
                  element={<OnbFaceScan />}
                />
                <Route
                  path="/seller-onboarding/store-profile"
                  element={<OnbStoreProfile />}
                />

                <Route
                  path="/seller-onboarding/pending"
                  element={<OnbPending />}
                />
                <Route
                  path="/seller-dashboard/manage-listings"
                  element={<ManageListings />}
                />
                <Route
                  path="/seller-dashboard/create-listing"
                  element={<CreateListing />}
                />
                <Route
                  path="/seller-dashboard/edit-listing/:id"
                  element={<CreateListing />}
                />
                <Route
                  path="/seller-dashboard/listing/:id"
                  element={<ProductDetailPage />}
                />

                <Route path="/profile" element={<Profile />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/seller/:id" element={<SellerProfile />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route
                  path="/admin/seller-verification/:userId"
                  element={<VerificationDetailPage />}
                />
                <Route
                  path="/admin/users/:userId"
                  element={<UserDetailPage />}
                />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/listings" element={<AdminListingsPage />} />
                <Route
                  path="/admin/seller-verification"
                  element={<AdminVerify />}
                />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route
                  path="/admin/categories/new"
                  element={<CategoryForm />}
                />
                <Route
                  path="/admin/categories"
                  element={<CategoryListPage />}
                />
                <Route
                  path="/admin/categories/:id"
                  element={<CategoryDetailPage />}
                />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
