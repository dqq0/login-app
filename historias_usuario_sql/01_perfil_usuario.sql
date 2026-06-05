-- Creación de la tabla para el Perfil de Usuario (Historia #5)
CREATE TABLE perfil_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    biografia TEXT,
    avatar_url VARCHAR(255) DEFAULT 'default_avatar.png',
    fecha_nacimiento DATE,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);