DROP TABLE IF EXISTS boletos;
DROP TABLE IF EXISTS eventos;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (rol IN ('usuario', 'admin')),
  verificado BOOLEAN NOT NULL DEFAULT FALSE,
  token_verificacion TEXT,
  token_recuperacion TEXT,
  token_recuperacion_expira TIMESTAMP,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE eventos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  lugar VARCHAR(160) NOT NULL,
  precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  cupos_disponibles INTEGER NOT NULL CHECK (cupos_disponibles >= 0),
  imagen TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE boletos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE RESTRICT,
  folio VARCHAR(40) NOT NULL UNIQUE,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  metodo_pago VARCHAR(60) NOT NULL DEFAULT 'tarjeta_simulada',
  estado VARCHAR(40) NOT NULL DEFAULT 'pagado_simulado',
  fecha_compra TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO eventos (titulo, descripcion, fecha, hora, lugar, precio, cupos_disponibles, imagen, estado)
VALUES
('Concierto Rosa Universitario', 'Noche musical con talentos de la universidad, luces rosas y ambiente lindo.', CURRENT_DATE + INTERVAL '7 days', '18:00', 'Auditorio Principal', 80.00, 120, 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80', 'activo'),
('Obra de Teatro: Cartas y Listones', 'Presentación teatral estudiantil con temática romántica y vintage.', CURRENT_DATE + INTERVAL '12 days', '17:30', 'Auditorio Principal', 60.00, 90, 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1000&q=80', 'activo'),
('Conferencia Tech Girls', 'Charla sobre programación, creatividad y tecnología para estudiantes.', CURRENT_DATE + INTERVAL '20 days', '10:00', 'Sala Magna', 0.00, 150, 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80', 'activo');
