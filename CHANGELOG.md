# Changelog

Todos los cambios notables de este proyecto seran documentados en este archivo.

El formato esta basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y este proyecto se adhiere a [Conventional Commits](https://www.conventionalcommits.org/).

## [Unreleased]

### Documentation
- **bitacora:** anexa Entrada #7 alcance backend
  Actualizacion de bitacora y alcance:


### Added
- **db:** ejecuta migraciones y seeds en postgresql
  Creacion y poblacion de la base de datos inventario_constructora:

- **api:** programa logica de negocio y endpoints
  Implementacion completa del rol Integrante 2 (Backend):

- **models:** implementa 7 modelos segun diagrama
  Implementacion de modelos y migraciones de inventario (Integrante 2):

- **backend:** inicializa express y conexion a db
  Configuracion del servidor backend (Integrante 2):

- inicializa entorno de skills y docs base
  Configura la base inicial del repositorio QUIZ-2:

### Changed
- **frontend:** desacopla datos mock y conecta cliente REST con backend real
  - Remueve todos los datos de prueba y semillas ficticias en mockData.js y localStorage.
  - Conecta inventoryService.js directamente a los endpoints de la API REST (/api/materiales, /api/movimientos, /api/ordenes, etc.).
  - Configura respuestas vacías tolerantes a fallos para desarrollo offline del backend.

### Fixed
- **frontend:** resuelve pantalla en blanco integrando GlobalErrorBoundary, safe parsing y unloader de Service Workers.

### Security

### Maintenance
