import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';

// Placeholder pages - will be implemented next
const MedicinesPage = () => <div className="container"><h1>Medicines</h1><p>Coming soon...</p></div>;
const AddMedicinePage = () => <div className="container"><h1>Add Medicine</h1><p>Coming soon...</p></div>;
const MedicineDetailPage = () => <div className="container"><h1>Medicine Detail</h1><p>Coming soon...</p></div>;
const ShoppingListPage = () => <div className="container"><h1>Shopping List</h1><p>Coming soon...</p></div>;
const SettingsPage = () => <div className="container"><h1>Settings</h1><p>Coming soon...</p></div>;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p className="text-muted mt-2">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p className="text-muted mt-2">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/medicines" element={<ProtectedRoute><MedicinesPage /></ProtectedRoute>} />
        <Route path="/add-medicine" element={<ProtectedRoute><AddMedicinePage /></ProtectedRoute>} />
        <Route path="/medicines/:id" element={<ProtectedRoute><MedicineDetailPage /></ProtectedRoute>} />
        <Route path="/shopping-list" element={<ProtectedRoute><ShoppingListPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
