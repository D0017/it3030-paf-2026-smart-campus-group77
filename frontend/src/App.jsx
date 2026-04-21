import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import BookingsPage from "./pages/BookingsPage";
import TicketsPage from "./pages/TicketsPage";
import NotificationsPage from "./pages/NotificationsPage";
import UsersPage from "./pages/UsersPage";
import LoginPage from "./pages/LoginPage";
import LoginSuccessPage from "./pages/LoginSuccessPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminResourceHub from "./components/AdminResourceHub";
import UserResourceHub from "./components/UserResourceHub";
import BookingPage from "./pages/BookingPage"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login-success" element={<LoginSuccessPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* User resources view */}
        <Route path="/resources" element={<UserResourceHub />} />

        {/* Admin resources view */}
        <Route path="/admin/resources" element={<AdminResourceHub />} />

        {/* Booking page route */}
        <Route path="/book/:id" element={<BookingPage />} />

        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}

export default App;