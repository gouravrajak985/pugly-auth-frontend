import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { auth } = useAuth();
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
