import { Curva, IndicadorCurva } from "../services/curvas.service";

// Clave de cada banda dentro del punto combinado
export const claveBanda = (z: number) => `z${z < 0 ? "m" : ""}${Math.abs(z)}`;

// Curvas que se dibujan por indicador.
export const bandasVisibles = (indicador: IndicadorCurva): number[] =>
  indicador === "talla-edad" ? [-3, -2, 0, 2, 3] : [-3, -2, -1, 0, 1, 2, 3];

// Color de cada curva, siguiendo el código del material de la OMS
export const colorBanda = (z: number): string => {
  const abs = Math.abs(z);
  if (abs === 3) return "#0f172a";
  if (abs === 2) return "#dc2626";
  if (abs === 1) return "#f59e0b";
  return "#16a34a";
};

export interface PuntoGrafica {
  x: number;
  paciente?: number;
  [banda: string]: number | undefined;
}

/* Combina las bandas y los puntos del paciente en un solo arreglo, que es el formato que espera Recharts. */
export const prepararDatos = (curva: Curva): PuntoGrafica[] => {
  const porX = new Map<number, PuntoGrafica>();

  const obtener = (x: number): PuntoGrafica => {
    let punto = porX.get(x);
    if (!punto) {
      punto = { x };
      porX.set(x, punto);
    }
    return punto;
  };

  for (const banda of curva.bandas) {
    for (const p of banda.puntos) {
      obtener(p.x)[claveBanda(banda.z)] = p.valor;
    }
  }

  for (const p of curva.paciente) {
    obtener(p.x).paciente = p.valor;
  }

  return Array.from(porX.values()).sort((a, b) => a.x - b.x);
};
