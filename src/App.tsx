import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import NuevoPaciente from './pages/NuevoPaciente';
import DetallePaciente from "./pages/DetallePaciente";
import FormularioMedicion from './pages/FormularioMedicion';
import DetalleMedicion from './pages/DetalleMedicion';
import RutaProtegida from "./components/RutaProtegida";
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path='/login' element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          element={
            <RutaProtegida>
              <MainLayout />
            </RutaProtegida>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/pacientes/nuevo" element={<NuevoPaciente />} />
          <Route path="/pacientes/:id" element={<DetallePaciente />} />
          <Route path="/pacientes/:id/nueva-medicion" element={<FormularioMedicion />} />
          <Route path="/pacientes/:id/mediciones/:idMedicion" element={<DetalleMedicion />} />
          <Route path="/pacientes/:id/mediciones/:idMedicion/editar" element={<FormularioMedicion />} />
        </Route>

        {/* Cualquier otra ruta */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;