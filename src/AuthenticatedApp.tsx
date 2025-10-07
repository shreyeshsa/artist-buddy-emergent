
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import AppLayout from "@/components/AppLayout";

const AuthenticatedApp = () => {
  const { isAuthenticated } = useAuth();

  // Temporarily always show main app for testing
  return <AppLayout />;
  // return isAuthenticated ? <AppLayout /> : <Login />;
};

export default AuthenticatedApp;
