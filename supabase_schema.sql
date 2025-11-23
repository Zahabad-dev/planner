-- Script SQL para configurar las tablas en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Eliminar tablas existentes si existen
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Tabla de clientes
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de proyectos
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- reels, post, historias, carrusel, tiktok
  nombre TEXT,
  fecha_entrega DATE,
  desarrollo TEXT,
  elementos TEXT,
  guion TEXT,
  duracion TEXT,
  referencias TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_fecha_entrega ON projects(fecha_entrega);

-- DESHABILITAR Row Level Security para acceso completo
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar cliente de prueba
INSERT INTO clients (name) VALUES ('Magnolias') ON CONFLICT (name) DO NOTHING;
INSERT INTO clients (name) VALUES ('Cliente Ejemplo') ON CONFLICT (name) DO NOTHING;
