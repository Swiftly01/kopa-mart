import { useAuth } from "@/context/AuthContext";
import React, { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  children?: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuth();

  if (isLoading) return null;
  if (!session) {
    return <Navigate to="/login" />;
  }

  return children ? <>{children}</> : <Outlet />;
}
