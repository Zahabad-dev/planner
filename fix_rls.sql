-- ⚠️ SCRIPT DE EMERGENCIA: DESHABILITAR RLS
-- Ejecuta este script en Supabase SQL Editor AHORA

-- 1. Ver estado actual
SELECT 
  tablename, 
  rowsecurity as rls_activo
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('clients', 'projects');

-- 2. Eliminar TODAS las políticas
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
      AND tablename IN ('clients', 'projects')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    RAISE NOTICE 'Eliminada política: % en tabla %', pol.policyname, pol.tablename;
  END LOOP;
END $$;

-- 3. Deshabilitar RLS
ALTER TABLE IF EXISTS public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;

-- 4. Verificar resultado
SELECT 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity = false THEN '✅ RLS DESACTIVADO CORRECTAMENTE'
    ELSE '❌ ERROR: RLS SIGUE ACTIVO'
  END as estado
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('clients', 'projects');

-- 5. Verificar que no quedan políticas
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ No hay políticas activas'
    ELSE '❌ Aún hay ' || COUNT(*) || ' políticas activas'
  END as resultado
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('clients', 'projects');

-- 6. Probar acceso directo a datos
SELECT 'Clientes en la base de datos:' as info, COUNT(*) as total FROM clients;
SELECT 'Proyectos en la base de datos:' as info, COUNT(*) as total FROM projects;
