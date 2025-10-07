
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Login from "./Login";
import AppLayout from "@/components/AppLayout";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <AppLayout /> : <Login />;
};

export default Index;
