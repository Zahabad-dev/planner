# Content Planner - Organizador de Ideas Creativas

Aplicación web para organizar y planificar ideas de contenido multimedia (Reels, Posts, Historias, Carruseles y TikToks).

## 🚀 Características

- **5 categorías de contenido**: Reels, Post, Historias, Carrusel y TikTok
- **Hasta 15 proyectos por categoría**
- **Campos completos por proyecto**:
  - Nombre del proyecto
  - Cliente
  - Fecha de entrega
  - Desarrollo
  - Elementos
  - Guion
  - Tiempo de duración
  - Referencias

- **Guardado automático** en localStorage
- **Diseño moderno y minimalista**
- **Totalmente responsive**
- **Sin necesidad de backend** (guardado local en el navegador)

## 📋 Requisitos Previos

- Node.js 16.x o superior
- npm o yarn

## 🛠️ Instalación

1. Instala las dependencias:

```bash
npm install
# o
yarn install
```

## 💻 Desarrollo

Ejecuta el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🏗️ Build para Producción

```bash
npm run build
npm start
# o
yarn build
yarn start
```

## 🌐 Deploy en Vercel

### Opción 1: Deploy desde GitHub

1. Sube este código a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa tu repositorio
4. Vercel detectará automáticamente Next.js y configurará todo
5. ¡Haz clic en Deploy!

### Opción 2: Deploy con Vercel CLI

```bash
npm i -g vercel
vercel
```

Sigue las instrucciones en la terminal.

## 📁 Estructura del Proyecto

```
appmain/
├── pages/
│   ├── _app.js          # Configuración global de la app
│   ├── _document.js     # Configuración del documento HTML
│   └── index.js         # Página principal
├── styles/
│   ├── globals.css      # Estilos globales
│   └── Home.module.css  # Estilos del componente Home
├── public/              # Archivos estáticos
├── .gitignore
├── .eslintrc.json
├── next.config.js       # Configuración de Next.js
├── package.json
└── README.md
```

## 🎨 Uso

1. **Selecciona una pestaña** (Reels, Post, Historias, Carrusel o TikTok)
2. **Haz clic en "Añadir Proyecto"** para crear un nuevo proyecto
3. **Completa los campos** de información del proyecto
4. Los datos se **guardan automáticamente** en tu navegador
5. **Elimina proyectos** con el botón × en la esquina superior derecha de cada tarjeta

## 🔄 Integración con Supabase (Opcional)

Para agregar persistencia en la nube con Supabase:

1. Instala el cliente de Supabase:
```bash
npm install @supabase/supabase-js
```

2. Crea una tabla en Supabase con la siguiente estructura:
```sql
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  type TEXT NOT NULL,
  nombre TEXT,
  cliente TEXT,
  fecha_entrega DATE,
  desarrollo TEXT,
  elementos TEXT,
  guion TEXT,
  duracion TEXT,
  referencias TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. Actualiza el código para usar Supabase en lugar de localStorage

## 📱 Tecnologías Utilizadas

- **Next.js 14** - Framework React
- **React 18** - Librería UI
- **CSS Modules** - Estilos con scope local
- **localStorage** - Persistencia de datos local

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT.

## 👤 Autor

Creado para organizar ideas creativas de contenido multimedia.

## 🐛 Reportar Bugs

Si encuentras algún bug, por favor abre un issue en el repositorio.

---

**¡Hecho con ❤️ para creadores de contenido!**
