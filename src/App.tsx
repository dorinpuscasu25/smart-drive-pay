import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CLERK_PUBLISHABLE_KEY } from './lib/clerk';
import { UserProvider } from './contexts/UserContext';
import { HomePage } from './pages/HomePage';
import { BuyTicketsPage } from './pages/BuyTicketsPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { SignUpPage } from './pages/SignUpPage';
import { SignInPage } from './pages/SignInPage';
import { ProfilePage } from './pages/ProfilePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  );
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedOut>{children}</SignedOut>
      <SignedIn>
        <Navigate to="/" replace />
      </SignedIn>
    </>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <UserProvider>
        <BrowserRouter>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ClerkProvider>
  );
}

export default App;
