# Requisitos del Proyecto

## Software
- Node.js 18 o superior (recomendado LTS)
- npm 9+ (incluido con Node)
- Navegador moderno (Chrome/Edge/Firefox)

## Cuentas/Servicios
- MongoDB Atlas (cluster con base `gym4ulsa`)

## Puertos utilizados
- Backend (Express + Apollo Server): 4001
- Frontend (Vite): 5173

## Dependencias clave
- Backend:
  - express, cors, @apollo/server, graphql, mongoose, jsonwebtoken, bcryptjs, dotenv
  - nodemon (dev)
- Frontend:
  - react, react-dom, @apollo/client, graphql
  - vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer

## Variables y configuración
- Backend (hardcodeado en `servidor/index.js`):
  - MONGODB_URI: `mongodb+srv://JorgeParra:4209@clusterulsa.ebajblo.mongodb.net/gym4ulsa?...`
  - JWT_SECRET: `dev_secret_change_later`
  - PORT: `4001`
- Frontend:
  - `cliente/.env` (opcional): `VITE_API_URL=http://localhost:4001/graphql`

## Instalación y ejecución
1. Instalar dependencias backend y frontend:
   - `npm --prefix servidor install`
   - `npm --prefix cliente install`
2. Ejecutar ambos en paralelo desde la raíz:
   - `npm run dev`
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4001

## Datos iniciales (opcional)
- `gym4ulsa.json` en la raíz como seed de referencia.

## Seguridad y desarrollo
- El login acepta `passwordHash` (bcrypt) y `password` en texto plano para datasets de desarrollo.
- Endpoints sensibles requieren `Authorization: Bearer <token>`.
- No subir credenciales reales al repositorio.
