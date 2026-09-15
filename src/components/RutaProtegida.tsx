import { Navigate } from "react-router-dom";
import { estaAutenticado } from "../services/auth.service";

interface RutaProtegidaProps {
  children: React.ReactNode;
}

function RutaProtegida({ children }: RutaProtegidaProps) {
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default RutaProtegida;