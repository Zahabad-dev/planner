# 🔍 Script de Diagnóstico

Copia y pega este código en la consola del navegador (F12) para diagnosticar el problema:

```javascript
// Ver el estado de Supabase
console.log('🔧 DIAGNÓSTICO DE SUPABASE');

// Importar cliente de Supabase (si está disponible globalmente)
async function diagnosticar() {
  const supabaseUrl = 'https://vtrhwgbukhycakdzqhun.supabase.co';
  const supabaseKey = 'TU_ANON_KEY_AQUI'; // Reemplaza con tu key
  
  console.log('1️⃣ Intentando cargar clientes...');
  
  const response = await fetch(`${supabaseUrl}/rest/v1/clients?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  });
  
  console.log('📊 Status:', response.status);
  console.log('📊 Status Text:', response.statusText);
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Clientes obtenidos:', data);
  } else {
    const error = await response.text();
    console.log('❌ Error:', error);
  }
}

diagnosticar();
```

## Verificar RLS en Supabase

Ejecuta en el SQL Editor:

```sql
-- Ver estado de RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('clients', 'projects');

-- Ver políticas activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public';
```

Si RLS está activo (true), ejecutar:

```sql
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
```
