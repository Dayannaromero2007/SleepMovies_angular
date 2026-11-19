# SleepMovies – Frontend (Angular)

Interfaz web del sistema **Taquilla de Cine (Sleep Movies)**. El proyecto está en la carpeta `sleepmovies`.

Integrantes: [completa los nombres]

## Requisitos

- Node.js y npm
- El backend (SleepMovies_api) corriendo en `http://localhost:8080`

## Ejecutar

```
cd sleepmovies
npm install
npm start
```

Abre `http://localhost:4200`. Usa siempre el puerto 4200, porque el backend solo acepta ese origen (CORS).

## Secciones

1. **Películas:** listar, buscar por ID, crear, editar y eliminar.
2. **Funciones:** tabla con el título de la película y formulario con lista desplegable de películas.
3. **Compra de boletas:** elegir función, cliente y cantidad. Muestra el valor total y el mensaje de error si no hay cupos suficientes.
4. **Historial de compras:** consulta por día o por rango de fechas, con el total vendido.

## Tecnologías

Angular (componentes standalone), `@if` / `@for`, formularios con `ngModel` y `HttpClient`.