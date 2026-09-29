import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { BuyTicketsPage } from './pages/BuyTicketsPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { SignUpPage } from './pages/SignUpPage';
import { SignInPage } from './pages/SignInPage';
import { ProfilePage } from './pages/ProfilePage';
import { ThankYouPage } from './pages/ThankYouPage';

import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      Loading...
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <FullPageLoader />;

  return isAuthenticated ? <>{children}</> : <Navigate to="/sign-in" replace />;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <FullPageLoader />;

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
              path="/sign-up"
              element={
                <PublicOnlyRoute>
                  <SignUpPage />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/sign-in"
              element={
                <PublicOnlyRoute>
                  <SignInPage />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/buy"
              element={
                <ProtectedRoute>
                  <BuyTicketsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tickets"
              element={
                <ProtectedRoute>
                  <MyTicketsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/thankyou/:orderId"
              element={
                <ProtectedRoute>
                  <ThankYouPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
