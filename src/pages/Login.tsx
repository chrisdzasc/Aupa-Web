import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        navigate("/dashboard");
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
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tucorreo@gmail.com"
                            className="w-full px-4 py-3 border border-teal-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                        />
                    </div>

                    <div className="mb-2">
                        <label className="block text-xs font-bold text-teal-700 uppercase mb-2">Contraseña</label>

                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border border-teal-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                        />
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