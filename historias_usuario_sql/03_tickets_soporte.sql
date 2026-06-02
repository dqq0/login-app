-- Creación de la tabla para la Central de Soporte (Historia #7)
CREATE TABLE tickets_soporte (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    asunto VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'abierto', -- 'abierto', 'en_progreso', 'cerrado'
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);