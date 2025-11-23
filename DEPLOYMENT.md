# Content Planner - Guía de Despliegue

## 📋 Pasos para desplegar en Vercel con Supabase

### 1. Configurar Supabase (Base de Datos)

1. **Crear cuenta en Supabase**
   - Ve a [https://supabase.com](https://supabase.com)
   - Crea una cuenta gratuita
   - Crea un nuevo proyecto

2. **Ejecutar el script SQL**
   - En tu proyecto de Supabase, ve a "SQL Editor"
   - Abre el archivo `supabase_schema.sql` de este proyecto
   - Copia y pega el contenido completo
   - Haz clic en "Run" para crear las tablas

3. **Obtener credenciales**
   - Ve a "Project Settings" > "API"
   - Copia el **Project URL** 
   - Copia la **anon/public key**

4. **Configurar variables de entorno locales**
   - Abre el archivo `.env.local`
   - Reemplaza los valores:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
     NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
     ```

### 2. Configurar Git

1. **Inicializar repositorio Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Content Planner"
   ```

2. **Crear repositorio en GitHub**
   - Ve a [https://github.com/new](https://github.com/new)
   - Crea un nuevo repositorio (público o privado)
   - NO inicialices con README

3. **Conectar con GitHub**
   ```bash
   git remote add origin https://github.com/tu-usuario/tu-repositorio.git
   git branch -M main
   git push -u origin main
   ```

### 3. Desplegar en Vercel

1. **Crear cuenta en Vercel**
   - Ve a [https://vercel.com](https://vercel.com)
   - Inicia sesión con tu cuenta de GitHub

2. **Importar proyecto**
   - Click en "Add New Project"
   - Selecciona tu repositorio de GitHub
   - Click en "Import"

3. **Configurar variables de entorno en Vercel**
   - En "Environment Variables" agrega:
     - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key de Supabase
   - Click en "Deploy"

4. **Auto-deploy está activado automáticamente**
   - Cada vez que hagas `git push` a GitHub
   - Vercel desplegará automáticamente los cambios

### 4. Comandos útiles

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Actualizar en GitHub (trigger auto-deploy)
git add .
git commit -m "Descripción de cambios"
git push
```

### 5. Migración de datos existentes

**IMPORTANTE:** Si ya tienes datos en localStorage, estos se perderán al cambiar a Supabase.

Para migrar:
1. Exporta tus proyectos actuales (puedes usar la función de exportar a Excel)
2. Después de configurar Supabase, re-crea tus clientes y proyectos en la nueva interfaz

### 6. Verificar despliegue

Una vez desplegado:
- Vercel te dará una URL como: `https://tu-proyecto.vercel.app`
- Prueba crear clientes y proyectos
- Verifica que se guarden en Supabase (ve al Table Editor en Supabase)

## 🔧 Solución de problemas

### Error: "Invalid Supabase credentials"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que no haya espacios extra en las keys

### Error: "Cannot read properties of undefined"
- Reinicia el servidor de desarrollo: `npm run dev`
- Verifica que el archivo `.env.local` esté en la raíz del proyecto

### Los cambios no se despliegan automáticamente
- Verifica la conexión Git en Vercel
- Revisa los logs de despliegue en el dashboard de Vercel

## 📊 Estructura del Proyecto

```
appmain/
├── pages/
│   ├── api/
│   │   ├── clients.js      # API para manejar clientes
│   │   └── projects.js     # API para manejar proyectos
│   ├── index.js            # Página principal
│   └── _app.js
├── lib/
│   └── supabase.js         # Cliente de Supabase
├── utils/
│   └── exportUtils.js      # Funciones de exportación
├── styles/
├── .env.local              # Variables de entorno (NO subir a Git)
├── .gitignore
├── supabase_schema.sql     # Script SQL para crear tablas
├── package.json
└── README.md
```

## 🎉 ¡Listo!

Tu Content Planner ahora está:
- ✅ Desplegado en Vercel
- ✅ Con base de datos en Supabase
- ✅ Auto-deploy desde GitHub
- ✅ Accesible desde cualquier dispositivo

---

**Soporte:** Si tienes problemas, revisa los logs en:
- Vercel Dashboard > Tu Proyecto > Deployments > Logs
- Supabase Dashboard > Logs
