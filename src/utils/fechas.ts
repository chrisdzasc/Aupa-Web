// Calcula la edad a partir de la fecha de nacimiento y la devuelve legible
export const calcularEdad = (fechaNacimiento: string): string => {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();

  let anios = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();

  if (hoy.getDate() < nacimiento.getDate()) {
    meses--;
  }

  if (meses < 0) {
    anios--;
    meses += 12;
  }

  if (anios === 0) {
    return `${meses} ${meses === 1 ? "mes" : "meses"}`;
  }

  if (meses === 0) {
    return `${anios} ${anios === 1 ? "año" : "años"}`;
  }

  return `${anios} ${anios === 1 ? "año" : "años"}, ${meses} ${meses === 1 ? "mes" : "meses"}`;
};

// Formatea una fecha ISO a "15 Sep 2026"
export const formatearFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return "Sin consultas";

  const d = new Date(fecha);
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  return `${String(d.getDate()).padStart(2, "0")} ${meses[d.getMonth()]} ${d.getFullYear()}`;
};

// Obtiene las iniciales de un nombre completo
export const obtenerIniciales = (nombre: string): string => {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
};

// Formatea 3312434323 → "33 1243 4323"
export const formatearTelefono = (telefono: string): string => {
  if (telefono.length !== 10) return telefono;
  return `${telefono.slice(0, 2)} ${telefono.slice(2, 6)} ${telefono.slice(6)}`;
};
