import { peticion } from "./api";
import { MedicionAPI } from "./paciente.service";

// Lo que el formulario envía a la API
export interface DatosMedicion {
  fechaConsulta: string;
  pesoKg: number;
  tallaCm: number;
  perimetroCefalicoCm?: number;
  perimetroBraquialCm?: number;
  cinturaCm?: number;
  abdomenCm?: number;
  caderaCm?: number;
  pantorrillaCm?: number;
  tricipitalMm?: number;
  notas?: string;
}

export const obtenerMedicion = async (
  id: string | number,
): Promise<MedicionAPI> => {
  const respuesta = await peticion(`/api/mediciones/${id}`);
  return respuesta.medicion;
};

export const crearMedicion = async (
  pacienteId: string | number,
  datos: DatosMedicion,
): Promise<MedicionAPI> => {
  const respuesta = await peticion(`/api/pacientes/${pacienteId}/mediciones`, {
    metodo: "POST",
    body: datos,
  });
  return respuesta.medicion;
};

export const editarMedicion = async (
  id: string | number,
  datos: DatosMedicion,
): Promise<MedicionAPI> => {
  const respuesta = await peticion(`/api/mediciones/${id}`, {
    metodo: "PUT",
    body: datos,
  });
  return respuesta.medicion;
};

export const eliminarMedicion = async (id: string | number): Promise<void> => {
  await peticion(`/api/mediciones/${id}`, { metodo: "DELETE" });
};
