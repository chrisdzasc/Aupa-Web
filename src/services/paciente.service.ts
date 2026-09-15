import { peticion } from "./api";

export interface PacienteLista {
  id: number;
  numeroExpediente: string;
  nombre: string;
  sexo: "M" | "F";
  fechaNacimiento: string;
  activo: boolean;
  tutor: {
    nombre: string;
    telefono: string;
    email: string;
    parentesco: string;
  };
  mediciones: { fechaConsulta: string }[];
}

export const listarPacientes = async (): Promise<PacienteLista[]> => {
  const respuesta = await peticion("/api/pacientes");
  return respuesta.pacientes;
};

export const obtenerPaciente = async (id: string | number) => {
  const respuesta = await peticion(`/api/pacientes/${id}`);
  return respuesta.paciente;
};
