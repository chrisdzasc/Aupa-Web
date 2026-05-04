import { error } from "console";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errores, setErrores] = useState<{ email?: string; password?: string }>({});

    const validar = () => {
        const nuevoErrores: { email?: string, password?: string } = {};

        if(!email.trim()) {
            nuevoErrores.email = "El correo electrónico es obligatorio";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nuevoErrores.email = "Ingresa un correo electrónico válido";
        }

        if(!password.trim()) {
            nuevoErrores.password = "La contraseña es obligatoria";
        }

        setErrores(nuevoErrores);

        return Object.keys(nuevoErrores).length === 0;
    };

    const handleLogin = () => {
        if(validar()) {
            navigate("/dashboard");
        }
    };

    return (
        <div className="min-h-screen bg-teal-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-teal-600 rounded-2xl p-6 mb-8 flex items-center gap-3 justify-center">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl">
                        🌿
                    </div>

                    <h1 className="text-3xl font-bold text-white">Aú<span className="text-amber-500">pa</span></h1>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">¡Bienvenido de nuevo!</h2>

                    <p className="text-sm text-gray-500 mb-6">Ingresa tus datos para continuar</p>

                    <div className="mb-4">
                        <label className="block text-xs font-bold text-teal-700 uppercase mb-2">Correo electrónico</label>

                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if(errores.email) setErrores({...errores, email: undefined});
                            }}
                            placeholder="tucorreo@gmail.com"
                            className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none ${ errores.email ? "border-red-400 focus:boder-red-500" : "border-teal-200 focus:border-teal-500" }`}
                        />
                        {errores.email && (
                            <p className="text-xs text-red-500 mt-1">{errores.email}</p>
                        )}
                    </div>

                    <div className="mb-2">
                        <label className="block text-xs font-bold text-teal-700 uppercase mb-2">Contraseña</label>

                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if(errores.password) setErrores({ ...errores, password: undefined });
                            }}
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none ${ errores.password ? "border-red-400 focus:border-red-500" : "border-teal-200 focus:border-teal-500" }`}
                        />
                        {errores.password && (
                            <p className="text-xs text-red-500 mt-1">{errores.password}</p>
                        )}
                    </div>

                    <div className="text-right mb-6">
                        <a href="#" className="text-sm text-teal-600 hover:tex-teal-800">¿Olvidaste tú contraseña?</a>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700"
                    >Iniciar Sesión</button>

                    <p className="text-center text-sm text-gray-500 mt-6">Plataforma exclusiva para profesionista de la salud</p>
                </div>
            </div>
        </div>
    );
}

export default Login;