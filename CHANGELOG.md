# Changelog

Todos los cambios notables de este proyecto seran documentados en este archivo.

El formato esta basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y este proyecto se adhiere a [Conventional Commits](https://www.conventionalcommits.org/).

## [Unreleased]

### Added
- **frontend:** implementa control de inventario
  Implementa el frontend completo para el sistema de control de inventario de Constructora Del Valle S.A. (Quiz #2, Opción 2).
  
  Componentes y características:
  - Arquitectura React 19 + Vite + Tailwind CSS en rama feature/alanie.
  - Capa de servicios y Mock API con persistencia en localStorage y custom hooks.
  - Cálculo reactivo inmutable de Punto de Reorden (PR) y Stock de Seguridad (SS).
  - Detección algorítmica de compras duplicadas (< 72h, <= 5% desvío) y sobreprecios.
  - 5 pantallas operativas: Dashboard, Materiales, Movimientos, Alertas e Historial.
  - Validación de saldo no negativo en salidas y trazabilidad cruzada con OCs.
  - Preparación para acople de backend real en apiConfig.js.
  - Registro completo en bitácora histórica de intervenciones técnicas.

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
