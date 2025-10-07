
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import AppLayout from "@/components/AppLayout";

const AuthenticatedApp = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <AppLayout /> : <Login />;
};

export default AuthenticatedApp;
