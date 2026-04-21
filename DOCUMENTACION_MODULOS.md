# Documentacion Completa De Modulos - Aeropuerto

## 1. Resumen Del Proyecto

Este proyecto es un frontend Angular con componentes standalone para el sistema Aeropuerto Los Primos.

Objetivos funcionales actuales:
- Mostrar portal principal.
- Permitir inicio de sesion.
- Permitir registro completo de usuario + pasajero.
- Gestionar CRUD de usuarios.

Tecnologias principales:
- Angular 21.1.x
- TypeScript
- RxJS
- Bootstrap 5

## 2. Estructura General

```text
src/
  environments/
  app/
    core/
      api.service.ts
      app-config.ts
      notification.service.ts
    models/
      user.ts
      passenger-registration.ts
    features/
      portal/
      login/
      register/
      users/
    shared/
      notification.component.*
```

## 3. Configuracion Global

Archivos clave:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Variable relevante:
- `usersApiUrl`

Importante:
- Los catalogos se consumen desde API.
- El frontend no administra catalogos.
- Los datos de catalogo siguen cargandose directamente en base de datos.

## 4. Core - Servicio De API

Archivo: `src/app/core/api.service.ts`

Responsabilidad:
- Centralizar llamadas HTTP de usuarios, login, registro y catalogos.

Metodos principales:
- `getUsers()` -> `GET /api/users`
- `getUser(id)` -> `GET /api/users/{id}`
- `createUser(user)` -> `POST /api/users`
- `registerPassenger(payload)` -> `POST /api/users/register`
- `getStatusCatalog()` -> `GET /api/catalogs/status`
- `getDocumentTypeCatalog()` -> `GET /api/catalogs/document-types`
- `getNationalityCatalog()` -> `GET /api/catalogs/nationalities`
- `login(payload)` -> `POST /api/users/login`
- `updateUser(id, user)` -> `PUT /api/users/{id}`
- `deleteUser(id)` -> `DELETE /api/users/{id}`
- `healthCheck()` -> `GET /api/status`
- `getDiagnostic()` -> `GET /`

## 5. Modelos

### 5.1 User

Archivo: `src/app/models/user.ts`

Campos:
- `id?`
- `username`
- `email`
- `password?`
- `createdAt?`
- `updatedAt?`
- `estadoId?`
- `estado?`
- `active?`

Nota:
- `active` se mantiene opcional solo como compatibilidad defensiva.
- El flujo nuevo usa `estadoId`.

### 5.2 PassengerRegistrationRequest

Archivo: `src/app/models/passenger-registration.ts`

Campos:
- `username`
- `email`
- `password`
- `tipoDocumentoId`
- `numeroDocumento`
- `nombreCompleto`
- `fechaNacimiento`
- `nacionalidadId`
- `codigoArea?`
- `telefono`
- `telefonoEmergencia?`
- `direccion`

## 6. Features

### 6.1 Portal

Permite navegar a:
- `/login`
- `/register`

### 6.2 Login

Archivo principal: `src/app/features/login/login.ts`

Comportamiento:
- envia `usernameOrEmail` y `password`;
- aplica `timeout(8000)`;
- muestra notificaciones con detalle tecnico;
- redirige a `/users` si la autenticacion es correcta.

### 6.3 Register

Archivos:
- `src/app/features/register/register.ts`
- `src/app/features/register/register.html`
- `src/app/features/register/register.css`

Comportamiento:
- crea usuario y pasajero en una sola operacion;
- valida campos obligatorios en frontend;
- carga tipos de documento y nacionalidades desde API;
- lee `areaCode` desde `GET /api/catalogs/nationalities` para autocompletar `codigoArea`;
- valida que exista `ACTIVO` en `status_catalog` para usar el estado por defecto;
- no permite seleccionar estado en la ventana publica de registro;
- usa el mismo lenguaje visual del portal;
- muestra mensajes inline dentro de la ventana;
- deshabilita `Crear cuenta` solo mientras la solicitud esta en curso;
- si falla, el boton vuelve a habilitarse por `finalize()`;
- usa el `message` del backend cuando el registro es exitoso;
- si backend devuelve `errors`, concatena los errores de validacion por campo y los muestra en pantalla;
- permite enviar `codigoArea` vacio para que backend lo resuelva desde la nacionalidad si asi viene configurado;
- envia notificaciones globales con detalle tecnico;
- redirige a `/login` cuando el registro es exitoso.

Mensajes de error contemplados:
- falla al cargar catalogos desde backend;
- backend inaccesible;
- validaciones rechazadas por la API;
- errores de servidor que pueden venir de catalogos no cargados o fallos transaccionales.

### 6.4 Users

Archivos:
- `src/app/features/users/users.ts`
- `src/app/features/users/users.html`

Comportamiento:
- lista usuarios;
- permite crear, editar y eliminar;
- carga estados desde `GET /api/catalogs/status`;
- usa `estadoId` en altas y ediciones;
- interpreta `estado` o `active` al pintar la tabla para soportar respuestas mixtas.

## 7. Notificaciones

Archivos:
- `src/app/core/notification.service.ts`
- `src/app/shared/notification.component.*`

Capacidades:
- mensajes `success`, `error`, `warning`, `info`;
- detalle expandible con `httpStatus`, `backendMessage`, `endpoint`, `timestamp` y `clientError`;
- persistencia en pantalla cuando `duration = 0`.

## 8. Flujo Funcional

1. Usuario entra al portal.
2. Puede iniciar sesion o registrarse.
3. En registro, el frontend carga catalogos desde API.
4. En registro, al elegir nacionalidad autocompleta `codigoArea` si la API devuelve `areaCode`.
5. En registro, envia un payload unico a `/api/users/register`.
6. Si el backend responde bien, se limpia el formulario y se redirige a login.
7. En login, si las credenciales son validas, se navega a `/users`.

## 9. Scripts

- `npm start`
- `npm run build`
- `npm run watch`
- `npm test`

## 10. Estado Tecnico Actual

- Registro funcional implementado en frontend.
- CRUD de usuarios alineado con `estadoId`.
- Los catalogos se consultan desde endpoints REST de solo lectura.
- La app muestra mensajes utiles cuando algo no funciona.

## 11. Recomendaciones

1. Agregar pruebas unitarias del formulario de registro y de la carga de catalogos.
2. Incorporar guardas de ruta para `/users`.
3. Si se agregan nuevos catalogos, centralizar su consumo en `ApiService`.
