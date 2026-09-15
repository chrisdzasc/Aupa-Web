import { peticion } from "./api";

interface DatosLogin {
  email: string;
  password: string;
}

export const login = async (datos: DatosLogin) => {
  const respuesta = await peticion("/api/auth/login", {
    metodo: "POST",
    body: datos,
    requiereAuth: false,
  });

  // Guardar el token y los datos del profesionista
  localStorage.setItem("token", respuesta.token);
  localStorage.setItem("profesionista", JSON.stringify(respuesta.profesionista));

  return respuesta;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("profesionista");
};

export const estaAutenticado = (): boolean => {
  return Boolean(localStorage.getItem("token"));
};

export const obtenerProfesionista = () => {
  const datos = localStorage.getItem("profesionista");
  return datos ? JSON.parse(datos) : null;
};