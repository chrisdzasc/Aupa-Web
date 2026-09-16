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

export interface DatosNuevoPaciente {
  nombre: string;
  sexo: "M" | "F";
  fechaNacimiento: string;
  semanasGestacion?: number;
  tipoParto?: "VAGINAL" | "CESAREA";
  pesoNacerKg?: number;
  tallaNacerCm?: number;
  perimetroCefalicoNacerCm?: number;
  tipoAlimentacion?: string;
  inicioComplementaria?: string;
  observaciones?: string;
  tutor: {
    nombre: string;
    parentesco: string;
    telefono: string;
    email: string;
    generarAcceso: boolean;
  };
  alertas?: { descripcion: string; tipo: "ALERGIA" | "CONDICION_CRONICA" }[];
  antecedentesFamiliares?: { condicion: string; detalle?: string }[];
  medicionInicial?: {
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
  };
}

export const crearPaciente = async (datos: DatosNuevoPaciente) => {
  const respuesta = await peticion("/api/pacientes", {
    metodo: "POST",
    body: datos,
  });
  return respuesta;
};
