import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import NuevoPaciente from './pages/NuevoPaciente';
import DetallePaciente from "./pages/DetallePaciente";
import FormularioMedicion from './pages/FormularioMedicion';
import DetalleMedicion from './pages/DetalleMedicion';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/pacientes/nuevo" element={<NuevoPaciente />} />
          <Route path="/pacientes/:id" element={<DetallePaciente />} />
          <Route path="/pacientes/:id/nueva-medicion" element={<FormularioMedicion />} />
          <Route path="/pacientes/:id/mediciones/:idMedicion" element={<DetalleMedicion />} />
          <Route path="/pacientes/:id/mediciones/:idMedicion/editar" element={<FormularioMedicion />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
