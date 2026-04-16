# Documentacion Completa De Modulos - Aeropuerto

## 1. Resumen Del Proyecto

Este proyecto es un frontend Angular (standalone components) para gestionar usuarios del sistema Aeropuerto Los Primos.

Objetivos funcionales actuales:
- Mostrar portal principal.
- Permitir inicio de sesion.
- Exponer ventana de registro (placeholder visual).
- Gestionar CRUD de usuarios (crear, listar, editar, eliminar).

Tecnologias principales:
- Angular 21.1.x
- TypeScript
- RxJS
- Bootstrap 5 (via CDN en `src/index.html`)

## 2. Estructura General

Estructura funcional relevante:

```text
src/
  main.ts
  index.html
  styles.css
  app/
    app.ts
    app.html
    app.css
    app.config.ts
    app.routes.ts
    core/
      api.service.ts
    models/
      user.ts
    features/
      portal/
      login/
      register/
      users/
```

## 3. Arranque De La Aplicacion

Archivo: `src/main.ts`

Flujo:
1. `bootstrapApplication(App, appConfig)` inicia la app con componente raiz standalone.
2. `appConfig` registra Router y HttpClient global.
3. `App` solo renderiza `<router-outlet>` para navegación por rutas.

## 4. Configuracion Global

### 4.1 Proveedores Globales

Archivo: `src/app/app.config.ts`

Proveedores usados:
- `provideBrowserGlobalErrorListeners()`
- `provideRouter(routes)`
- `provideHttpClient()`

### 4.2 Ruteo

Archivo: `src/app/app.routes.ts`

Rutas activas:
- `/` -> `Portal`
- `/login` -> `Login`
- `/register` -> `Register`
- `/users` -> `Users`

Nota: no hay guardas (`AuthGuard`) en esta version, por eso `/users` es accesible directamente.

## 5. Modulo Raiz (Shell)

### 5.1 Componente `App`

Archivos:
- `src/app/app.ts`
- `src/app/app.html`
- `src/app/app.css`

Responsabilidad:
- Ser contenedor raiz de la app.
- Delegar toda la UI a rutas mediante `router-outlet`.

Estado:
- `title = signal('aeropuerto')` (no usado en plantilla actual).

## 6. Core - Servicio De API

### 6.1 `ApiService`

Archivo: `src/app/core/api.service.ts`

Responsabilidad:
- Centralizar todas las llamadas HTTP del frontend para usuarios/login.

Base URL actual:
- `private API = environment.usersApiUrl;`

Definicion por entorno:
- `src/environments/environment.ts` (desarrollo) -> `http://localhost:8080/api/users`
- `src/environments/environment.prod.ts` (produccion) -> `https://aeropuerto-los-primos-backend.onrender.com/api/users`

Esto significa que en local usa localhost y en produccion usa Render.

### 6.2 Contratos Y Metodos

Tipo auxiliar:
- `LoginRequest { usernameOrEmail: string; password: string; }`

Metodos:
- `getUsers(): Observable<User[]>`
  - `GET /api/users`
- `createUser(user: User): Observable<User>`
  - `POST /api/users`
- `login(payload: LoginRequest): Observable<any>`
  - `POST /api/users/login`
- `updateUser(id: number, user: User): Observable<User>`
  - `PUT /api/users/{id}`
- `deleteUser(id: number)`
  - `DELETE /api/users/{id}`

## 7. Modelos

### 7.1 `User`

Archivo: `src/app/models/user.ts`

Estructura:
- `id?: number`
- `username: string`
- `email: string`
- `password?: string`
- `createdAt?: string`
- `updatedAt?: string`
- `active: boolean`

## 8. Features

## 8.1 Feature Portal

Archivos:
- `src/app/features/portal/portal.ts`
- `src/app/features/portal/portal.html`
- `src/app/features/portal/portal.css`

Rol funcional:
- Pantalla de entrada al sistema.
- Navegacion principal hacia login y registro.

Acciones de usuario:
- Boton/link `Iniciar sesion` -> `/login`
- Boton/link `Registrarse` -> `/register`

## 8.2 Feature Login

Archivos:
- `src/app/features/login/login.ts`
- `src/app/features/login/login.html`
- `src/app/features/login/login.css`

Responsabilidad:
- Recibir credenciales y llamar a API de login.

Estado interno principal:
- `loginForm.usernameOrEmail`
- `loginForm.password`
- `showLoginPassword`
- `isLoggingIn`
- `loginStatusMessage`
- `loginStatusType`

Flujo de `login()`:
1. Hace `trim()` a usuario/email y password.
2. Valida que ambos existan.
3. Llama `api.login(...)`.
4. Aplica `timeout(8000)`.
5. Usa `finalize` para liberar estado de carga.
6. Si es exitoso:
   - muestra mensaje,
   - limpia formulario,
   - navega a `/users`.
7. Si falla:
   - intenta leer mensaje backend (`mensaje` o `message`),
   - usa fallback de timeout/credenciales invalidas,
   - notifica con alert.

Navegacion secundaria en pantalla:
- `Ir al CRUD sin loguearse` -> `/users`
- `Regresar al portal` -> `/`

## 8.3 Feature Register

Archivos:
- `src/app/features/register/register.ts`
- `src/app/features/register/register.html`
- `src/app/features/register/register.css`

Estado actual:
- Es una ventana placeholder (informativa).
- No contiene formulario ni consume API.
- Incluye retorno al portal (`/`).

## 8.4 Feature Users (CRUD)

Archivos:
- `src/app/features/users/users.ts`
- `src/app/features/users/users.html`
- `src/app/features/users/users.css`

Responsabilidad:
- Gestion completa de usuarios (listar, crear, editar, eliminar).

Estado interno principal:
- `users: User[]`
- `showForm: boolean`
- `editMode: boolean`
- `editingUserId: number | null`
- `newUser: User`

Metodos y comportamiento:
- `ngOnInit()`
  - Carga lista inicial via `loadUsers()`.
- `loadUsers()`
  - Llama `api.getUsers()` y actualiza tabla.
- `addNew()`
  - Cambia a modo alta, limpia formulario y abre card.
- `editUser(u)`
  - Cambia a modo edicion, guarda `editingUserId`, precarga datos.
- `saveNewUser()`
  - Validaciones:
    - username obligatorio,
    - email valido,
    - password minima de 8 para alta,
    - en edicion password opcional (si llega, minimo 8).
  - Construye `payload` con `username`, `email`, `active`.
  - Agrega `password` solo si fue ingresada.
  - Decide operación:
    - `createUser(payload)` en alta,
    - `updateUser(editingUserId, payload)` en edicion.
  - En exito recarga tabla y resetea estado.
  - En error muestra mensaje de backend o fallback.
- `deleteUser(id)`
  - Elimina y luego recarga lista.
- `cancelAdd()`
  - Cierra formulario y limpia estado.

Campos visibles en tabla:
- ID, Username, Email, Estado, Creado, Actualizado, Acciones.

## 9. Estilos

Archivos globales:
- `src/styles.css`: vacio.
- `src/app/app.css`: vacio.

Estilos por feature:
- Login: diseño con gradientes, panel y tarjeta responsiva.
- Portal: landing con fondo degradado y navegación principal.
- Register: tarjeta central minimalista.
- Users: barra superior CRUD y ajuste visual de tabla/badges.

## 10. Configuracion De Build Y Scripts

### 10.1 `package.json`

Scripts:
- `npm start` -> `ng serve`
- `npm run build` -> `ng build`
- `npm run watch` -> build watch en `development`
- `npm test` -> `ng test`

Dependencias relevantes:
- `@angular/*` (core, common, forms, router, platform-browser)
- `rxjs`

### 10.2 `angular.json`

Puntos importantes:
- Builder: `@angular/build:application`.
- Entrada principal: `src/main.ts`.
- Estilos globales: `src/styles.css`.
- `build.defaultConfiguration = production`.
- `serve.defaultConfiguration = development`.

Estado de entornos:
- Existe carpeta `src/environments`.
- `angular.json` tiene `fileReplacements` para produccion.
- `ApiService` usa `environment.usersApiUrl`.

Configuracion de produccion solicitada:

```ts
export const environment = {
  production: true,
  usersApiUrl: 'https://aeropuerto-los-primos-backend.onrender.com/api/users'
};
```

## 11. Pruebas

Archivos:
- `src/app/app.spec.ts`
- `src/app/core/api.service.spec.ts`
- `src/app/features/users/users.spec.ts`

Cobertura actual:
- Pruebas de creación de componentes/servicio (smoke tests).

Observacion tecnica:
- `app.spec.ts` incluye una prueba que busca un `h1` con texto "Hello, aeropuerto".
- La plantilla real (`app.html`) solo contiene `<router-outlet>`.
- Esa prueba puede fallar si se ejecuta tal cual.

## 12. Flujo Funcional End-To-End

1. Usuario abre `/` y ve portal.
2. Puede ir a `/login` o `/register`.
3. En login:
   - valida credenciales con backend,
   - al exito redirige a `/users`.
4. En `/users`:
   - consulta listado,
   - crea/edita/elimina usuarios,
   - puede volver al login con "Cerrar sesion".

## 13. Dependencias Entre Modulos

Relaciones principales:
- `App` -> `RouterOutlet` -> carga features por `app.routes.ts`.
- `Login` y `Users` -> dependen de `ApiService`.
- `Users` -> usa modelo `User` para estado/formulario/payload.
- `Portal`, `Login`, `Register`, `Users` -> usan navegación con `RouterLink` o `Router`.

## 14. Estado Tecnico Actual (Resumen Ejecutivo)

- Arquitectura standalone simple y clara.
- Flujo principal portal/login/crud implementado.
- Registro aun no implementado funcionalmente (solo UI).
- API acoplada a localhost desde `ApiService`.
- Pruebas unitarias minimas; hay al menos una prueba desalineada con UI actual.

## 15. Recomendaciones Inmediatas

1. Mantener `src/environments/environment*.ts` y `usersApiUrl` como fuente unica de URL API.
2. Implementar registro real en `Feature Register`.
3. Agregar guardas de ruta para proteger `/users`.
4. Reforzar pruebas de login/CRUD y corregir `app.spec.ts`.
5. Sustituir `alert(...)` por mensajes UI no bloqueantes (toasts/snackbar).
