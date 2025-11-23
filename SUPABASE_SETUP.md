# 🔧 INSTRUCCIONES URGENTES - Configurar Supabase

## ⚠️ IMPORTANTE: Debes hacer esto AHORA para que funcione

### Paso 1: Ejecutar el Script SQL Actualizado

1. **Abre Supabase**: https://supabase.com/dashboard
2. **Ve a tu proyecto**: `basenow`
3. **Abre el SQL Editor**: 
   - En el menú lateral izquierdo, click en el icono SQL (📝)
4. **Copia TODO el contenido** del archivo `supabase_schema.sql`
5. **Pégalo en el editor SQL**
6. **Click en "RUN"** (botón verde abajo a la derecha)
7. **Espera a que diga "Success"**

### Paso 2: Verificar que las tablas se crearon

1. **Ve a "Table Editor"** en el menú izquierdo
2. **Deberías ver 2 tablas**:
   - ✅ `clients`
   - ✅ `projects`

### Paso 3: Probar la aplicación

1. **Recarga la aplicación** en Vercel: https://planner-roan-six.vercel.app
2. **Haz login** con:
   - Usuario: KODART
   - Contraseña: Losmejores2025@
3. **Click en "Gestionar Clientes"**
4. **Agrega un cliente de prueba**: Ej: "Magnolias"
5. **Deberías ver el cliente en la lista**

## 🐛 Si sigue sin funcionar

### Opción A: Verificar las políticas RLS en Supabase

1. Ve a **Authentication** > **Policies**
2. Verifica que en la tabla `clients` y `projects` aparezcan las políticas:
   - "Allow all for clients"
   - "Allow all for projects"

### Opción B: Desactivar RLS temporalmente (solo para pruebas)

En el SQL Editor, ejecuta:

```sql
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
```

**NOTA:** Esto es solo para pruebas. Como solo KODART tiene acceso, es seguro temporalmente.

## 📊 Ver errores en la consola del navegador

1. En la aplicación, presiona **F12**
2. Ve a la pestaña **Console**
3. Intenta agregar un cliente
4. **Copia cualquier error** que aparezca en rojo y envíamelo

---

**Una vez hagas estos pasos, avísame si funciona o qué error te muestra.**
