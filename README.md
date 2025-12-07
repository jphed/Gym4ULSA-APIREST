# mi-proyecto-fullstack

Proyecto fullstack con backend Apollo Server (Express + Mongoose) y frontend React + Vite + Tailwind. Incluye REST, GraphQL y una UI para login y panel de usuario.

## Requisitos
- Node.js 18+
- MongoDB Atlas o instancia compatible

## Puertos y URLs
- Backend REST/GraphQL: http://localhost:4001
  - REST dump: http://localhost:4001/api/db/dump
  - GraphQL: http://localhost:4001/graphql
- Frontend: http://localhost:5173

## Instalación
En la raíz del monorepo:
```
npm install
```
Esto instalará dependencias en `servidor/` y `cliente/`.

## Desarrollo
- Levantar ambos (servidor y cliente):
```
npm run dev
```
- Solo backend:
```
npm run server
```
- Solo frontend:
```
npm run client
```

## Login y panel
- Inicia sesión (ejemplo): `jorge@example.com` / `4209`.
- Tras login, el panel muestra perfil, comidas, rutinas y suplementos del usuario autenticado.
- El botón "Refrescar" vuelve a leer la base para ver cambios.

## Estructura
- servidor/ — Apollo Server sobre Express, conexión Mongoose, modelos, typeDefs y resolvers.
- cliente/ — React + Vite + Tailwind, Apollo Client, páginas básicas.

## Endpoints REST principales
- Auth: `POST /api/auth/login`, `POST /api/auth/signup`
- Usuario (requiere token):
  - `PATCH /api/user/me` (actualizar perfil)
  - `POST /api/user/meals` (crear día de comidas)
  - `PUT /api/user/routines` (asignar rutinas)
  - `PUT /api/user/supplements` (asignar suplementos)
- Dump de base (lectura): `GET /api/db/dump`

## Endpoints CRUD genéricos (requiere token para POST/PATCH/DELETE)
Base: `http://localhost:4001/api`
- `GET /crud/:collection`
- `GET /crud/:collection/:id`
- `POST /crud/:collection`
- `PATCH /crud/:collection/:id`
- `DELETE /crud/:collection/:id`

Colecciones permitidas: `users`, `meals`, `user_supplements`, `user_routines`, `foods`, `supplements`, `training_routines`, `training_exercises`, `nutrition_settings`, `projects`.

## Variables y configuración
- Backend tiene valores hardcodeados en `servidor/index.js` (MONGODB_URI, JWT_SECRET, PORT=4001).
- Puedes ajustar `cliente/.env` si cambias el endpoint GraphQL.

## Datos de prueba
En la raíz hay `gym4ulsa.json` (seed de ejemplo). Puedes importar manualmente a tu colección o crear un script de seed propio.
