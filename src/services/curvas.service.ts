import { peticion } from "./api";

export type IndicadorCurva =
  | "talla-edad"
  | "peso-edad"
  | "imc-edad"
  | "peso-talla"
  | "perimetro-cefalico-edad";

export interface PuntoBanda {
  x: number;
  valor: number;
}

export interface Banda {
  z: number;
  puntos: PuntoBanda[];
}

export interface PuntoPaciente {
  x: number;
  valor: number;
  z: number | null;
  fechaConsulta: string;
}

export interface Curva {
  indicador: IndicadorCurva;
  etiqueta: string;
  referencia: string;
  sexo: "M" | "F";
  eje: {
    tipo: "edad" | "talla";
    unidad: "meses" | "cm";
    min: number;
    max: number;
  };
  unidadValor: string;
  bandas: Banda[];
  paciente: PuntoPaciente[];
}

export const obtenerCurva = async (
  pacienteId: string | number,
  indicador: IndicadorCurva,
): Promise<Curva> => {
  return peticion(`/api/pacientes/${pacienteId}/curvas?indicador=${indicador}`);
};
