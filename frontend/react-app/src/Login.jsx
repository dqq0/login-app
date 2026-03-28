import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Paso 2: Conectar los cables (El Fetch)
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Error en las credenciales');
      }

      const data = await response.json();
      
      // Paso 3: Guardar la llave
      if (data.token) {
        localStorage.setItem('jwt_token', data.token);
        
        // Redirigir al usuario a la pantalla principal de las salas de chat
        window.location.href = '/chat';
      } else {
        setError('No se recibió el token');
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error al procesar la solicitud');
    }
  };

  // Paso 1: Maquetar la pantalla (HTML listo sin diseño)
  return (
    <div>
      <h1>Ingreso de Empleados</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Usuario / Correo:</label>
          <input 
            type="email" 
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input 
            type="password" 
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;
