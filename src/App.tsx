import React from "react";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Login, ForgotPassword, ResetPassword, RegisterPage } from "@/pages/auth";
import { Dashboard } from "@/pages/dashboard";
import { ClientsList, ClientDetail } from "@/pages/clients";
import { VehiclesList } from "@/pages/vehicles";
import { InsurersList } from "@/pages/insurers";
import { QuotesList } from "@/pages/quotes";
import { PoliciesList } from "@/pages/policies";
import { RenewalsList } from "@/pages/renewals";
import { FinancePage } from "@/pages/finance";
import { ReportsPage } from "@/pages/reports";
import { AuditPage, UsersPage } from "@/pages/audit";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Toast } from "@/components/ui/sonner";

// No instalador (Electron) as páginas são abertas como arquivo (file://),
// onde o BrowserRouter não funciona; lá usamos rotas com # (HashRouter).
const Router = window.location.protocol === "file:" ? HashRouter : BrowserRouter;

function App() {
  return (
    <AuthProvider>
        <Toast />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clients" element={<ClientsList />} />
              <Route path="/clients/new" element={<ClientsList />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/vehicles" element={<VehiclesList />} />
              <Route path="/insurers" element={<InsurersList />} />
              <Route path="/quotes" element={<QuotesList />} />
              <Route path="/policies" element={<PoliciesList />} />
              <Route path="/renewals" element={<RenewalsList />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/audit" element={<AuditPage />} />
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;
