# aeropuerto-los-primos-fronted

Frontend del sistema Aeropuerto Los Primos construido con Angular 21.

## Estado actual

- Portal principal con estilo visual propio.
- Login conectado a `POST /api/users/login`.
- Registro conectado a `POST /api/users/register`.
- Catalogos cargados desde backend por endpoints de solo lectura.
- CRUD de usuarios alineado con `estadoId`.

## Catalogos consumidos por frontend

El frontend consulta estos endpoints:

- `GET /api/catalogs/status`
- `GET /api/catalogs/document-types`
- `GET /api/catalogs/nationalities`

Uso actual:

- `register` carga tipos de documento y nacionalidades desde API.
- `register` usa `areaCode` de la nacionalidad para autocompletar `codigoArea`.
- `register` no deja elegir estado; el backend debe asignar `ACTIVO` por defecto.
- `users` carga el catalogo de estados desde API para mostrar y editar estados.

## Registro

La pantalla `/register`:

- usa el mismo lenguaje visual del portal;
- crea `users` y `passengers` en una sola operacion;
- muestra mensajes visibles cuando falla la carga de catalogos o el registro;
- si el alta sale bien muestra el mensaje del backend, por ejemplo `Usuario y pasajero registrados correctamente`;
- si falla una validacion muestra el detalle por campo cuando el backend responde `errors`;
- si `codigoArea` queda vacio, el backend puede completarlo desde `nationality_catalog.area_code`;
- redirige a `/login` cuando el alta es correcta.

## Scripts

- `npm start`
- `npm run build`
- `npm test`
