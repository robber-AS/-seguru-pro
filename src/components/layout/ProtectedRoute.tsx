import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: ("admin" | "corretor")[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto py-12 text-center">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-navy mb-2">Acesso não autorizado</h2>
            <p className="text-gray-600 mb-6">Você não tem permissão para acessar esta página.</p>
            <button onClick={() => navigate("/dashboard")} className="btn-secondary">
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return <Layout>{children ?? <Outlet />}</Layout>;
};
