-- Script SQL para configurar las tablas en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS projects (
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
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_fecha_entrega ON projects(fecha_entrega);

-- Habilitar Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Permitir todo acceso a clients" ON clients;
DROP POLICY IF EXISTS "Permitir todo acceso a projects" ON projects;

-- Políticas de acceso - Solo para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver clients" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar clients" ON clients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar clients" ON clients
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar clients" ON clients
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver projects" ON projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar projects" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar projects" ON projects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar projects" ON projects
  FOR DELETE USING (auth.role() = 'authenticated');

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
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREAR USUARIO KODART
-- Nota: Este usuario debe crearse manualmente en Supabase Authentication
-- Ve a Authentication > Users > Add User
-- Email: kodart@planner.local
-- Password: Losmejores2025@
