import { peticion } from "./api";

export type EstadoCita =
  | "PENDIENTE"
  | "COMPLETADA"
  | "NO_ASISTIO"
  | "CANCELADA";

export interface Cita {
  id: number;
  fecha: string; // "2026-12-18"
  hora: string; // "16:00"
  estado: EstadoCita;
  notas: string | null;
  pacienteId: number;
  paciente?: {
    id?: number;
    nombre: string;
    numeroExpediente: string;
    sexo?: "M" | "F";
  };
}

export interface DatosCita {
  pacienteId: number;
  fecha: string;
  hora: string;
  notas?: string;
}

export const crearCita = async (datos: DatosCita): Promise<Cita> => {
  const respuesta = await peticion("/api/citas", {
    metodo: "POST",
    body: datos,
  });
  return respuesta.cita;
};

/* Agenda del profesionista en un rango de fechas */
export const listarCitas = async (
  desde: string,
  hasta: string,
  todas = false,
): Promise<Cita[]> => {
  const respuesta = await peticion(
    `/api/citas?desde=${desde}&hasta=${hasta}${todas ? "&todas=true" : ""}`,
  );
  return respuesta.citas;
};

/* Citas de un paciente, de la más reciente a la más antigua */
export const listarCitasPaciente = async (
  pacienteId: string | number,
): Promise<Cita[]> => {
  const respuesta = await peticion(`/api/pacientes/${pacienteId}/citas`);
  return respuesta.citas;
};

export const editarCita = async (
  id: number,
  datos: Omit<DatosCita, "pacienteId">,
): Promise<Cita> => {
  const respuesta = await peticion(`/api/citas/${id}`, {
    metodo: "PUT",
    body: datos,
  });
  return respuesta.cita;
};

export const cambiarEstadoCita = async (
  id: number,
  estado: EstadoCita,
): Promise<Cita> => {
  const respuesta = await peticion(`/api/citas/${id}/estado`, {
    metodo: "PATCH",
    body: { estado },
  });
  return respuesta.cita;
};

export const eliminarCita = async (id: number): Promise<void> => {
  await peticion(`/api/citas/${id}`, { metodo: "DELETE" });
};

export interface ResumenDia {
  total: number;
  pendientes: number;
}

/* Totales de la agenda de un día, para las tarjetas del dashboard */
export const obtenerResumen = async (fecha: string): Promise<ResumenDia> => {
  return peticion(`/api/citas/resumen?fecha=${fecha}`);
};
