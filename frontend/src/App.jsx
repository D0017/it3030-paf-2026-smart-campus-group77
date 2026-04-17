import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ResourcesPage from "./pages/ResourcesPage"; 
import BookingsPage from "./pages/BookingsPage";
import TicketsPage from "./pages/TicketsPage";
import NotificationsPage from "./pages/NotificationsPage";
import UsersPage from "./pages/UsersPage";
import LoginPage from "./pages/LoginPage";
import LoginSuccessPage from "./pages/LoginSuccessPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import AssetsCataloguePage from './pages/AssetsCataloguePage'; 

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login-success" element={<LoginSuccessPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Member 1: Assets Catalogue */}
        <Route path="assets" element={<AssetsCataloguePage />} />
        
        {/* අනිත් සාමාජිකයින්ගේ Routes */}
        <Route path="resources" element={<ResourcesPage />} /> 
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}

export default App;