# 🏗️ QUIZ #2 · Sistema de Gestión de Inventarios y Compras
### Constructora Del Valle S.A. — Componente Backend (Integrante 2)

API REST profesional desarrollada en **Node.js + Express** con persistencia relacional en **PostgreSQL** mediante **Sequelize ORM**, diseñada bajo principios de normalización a **Tercera Forma Normal (3FN)**, arquitectura por capas desacoplada y validación rigurosa de reglas de negocio de compras e inventario.

---

## 📋 Responsabilidades Implementadas (Integrante 2)

| # | Responsabilidad | Estado | Implementación |
|---|---|:---:|---|
| 1 | Servidor Node.js + Express | ✅ Completado | `src/app.js`, `src/index.js`, middlewares globales, CORS, 404 y errorHandler centralizado. |
| 2 | Consultar y registrar materiales | ✅ Completado | `GET /api/materiales`, `POST /api/materiales`, `GET /api/materiales/:id`. |
| 3 | Registro y validación de movimientos | ✅ Completado | `POST /api/movimientos`, transacciones atómicas Sequelize (`SERIALIZABLE`), prevención de saldos negativos. |
| 4 | Cálculo de stock actual dinámico | ✅ Completado | $\text{Stock} = \sum \text{Entradas} - \sum \text{Salidas} \pm \sum \text{Ajustes}$. Endpoint `GET /api/materiales/:id/stock`. |
| 5 | Cálculo del punto de reorden (PR) | ✅ Completado | $SS = (d_{\max} - d) \times L$, $PR = d \times L + SS = d_{\max} \times L$. Calculado en tiempo real, no digitado. |
| 6 | Detección de posibles compras duplicadas | ✅ Completado | `GET /api/ordenes/duplicados`. Algoritmo cruzado de 5 condiciones (proveedor, material, ventana 7 días, $\Delta \le 10\%$). |
| 7 | Generación de alertas de reposición | ✅ Completado | `GET /api/alertas`. Evalúa $\text{Stock} \le PR$, categoriza en `CRÍTICO` o `ALERTA_REORDEN` y calcula reposición sugerida. |
| 8 | Manejo de errores y validación de datos | ✅ Completado | `validaciones.js`, `errorHandler.js` canónico (200, 201, 400, 401, 403, 404, 409, 500). |
| ➕ | **Puntos Extra: Pruebas automatizadas** | ✅ Completado | Suite de 19 pruebas unitarias ejecutadas con `npm test` probando toda la lógica de negocio y casos borde. |

---

## 📐 Arquitectura del Proyecto

```text
QUIZ-2-/
├── .agents/skills/              # Skills instaladas (backend-postgres-guardian, bitacora-agente, etc.)
├── backend/
│   ├── src/
│   │   ├── config/              # Conexión Sequelize y script de sincronización
│   │   ├── controllers/         # Controladores HTTP (materiales, movimientos, alertas, ordenes, auth)
│   │   ├── middlewares/         # Autenticación JWT y validadores de esquemas
│   │   ├── migrations/          # 7 migraciones versionadas (3FN con índices FK y down reversible)
│   │   ├── models/              # 7 modelos Sequelize (Usuario, Proveedor, Ubicacion, Material, Orden, Detalle, Movimiento)
│   │   ├── routes/              # Routers Express modulares montados en app.js
│   │   ├── seeders/             # Carga inicial con casos reales del Quiz (Parte A y B)
│   │   ├── services/            # Lógica pura de negocio desacoplada de HTTP
│   │   ├── app.js               # Configuración de Express y middlewares globales
│   │   └── index.js             # Punto de entrada y arranque del servidor HTTP
│   ├── tests/
│   │   └── reglasNegocio.test.js # 19 pruebas unitarias automatizadas (Node.js Test Runner)
│   ├── .env.example             # Plantilla de variables de entorno (sin credenciales)
│   ├── .sequelizerc             # Configuración de rutas para Sequelize CLI
│   ├── package.json             # Scripts de ejecución, migraciones, seeders y tests
│   └── requests.http            # Colección completa de pruebas de endpoints
├── bitacora_agente.md           # Registro cronológico auditado de intervenciones
├── CHANGELOG.md                 # Historial de versiones del repositorio
├── README.md                    # Documentación principal del proyecto
└── SECURITY.md                  # Políticas de seguridad del repositorio
```

---

## 🚀 Puesta en Marcha (Instalación Rápida)

### 1. Requisitos Previos
- **Node.js** v18+ (recomendado v20+ o v24).
- **PostgreSQL** v14+ instalado y corriendo en `localhost:5432`.

### 2. Configuración de Variables de Entorno
Crea el archivo `backend/.env` basándote en `backend/.env.example`:
```env
PORT=3000
NODE_ENV=development

# Credenciales de PostgreSQL
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=inventario_constructora
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui

# Seguridad JWT
JWT_SECRET=super_secreto_quiz2_constructora_del_valle_token_seguro
JWT_EXPIRES_IN=25m
```

### 3. Instalar Dependencias
```bash
cd backend
npm install
```

### 4. Crear Base de Datos, Ejecutar Migraciones y Cargar Seeds
```bash
# 1. Crear base de datos (si aún no existe)
npx sequelize-cli db:create

# 2. Ejecutar las 7 migraciones relacionales
npm run db:migrate

# 3. Poblar la base de datos con los datos semilla del Quiz
npm run db:seed
```

### 5. Iniciar el Servidor
```bash
# Modo desarrollo con recarga automática:
npm run dev

# Modo producción:
npm start
```
El servidor quedará disponible en: `http://localhost:3000`.

---

## 🧪 Pruebas Automatizadas (Puntos Extra de Rúbrica)

El proyecto incluye una suite automatizada de **19 pruebas unitarias** que verifican exhaustivamente todas las fórmulas de inventario, detección de duplicados y prevención de saldos negativos con casos borde:

```bash
npm test
```

### Resultado de la Ejecución:
```text
▶ Lógica de Negocio - Gestión de Inventarios (Quiz 2)
  ▶ Ejercicio A5: Fórmulas de Stock de Seguridad y Punto de Reorden (6 tests pass)
  ▶ Evaluación de Estado de Stock y Alertas de Reposición (5 tests pass)
  ▶ Cálculo de Stock Dinámico a partir de Movimientos (3 tests pass)
  ▶ Detección Algorítmica de Compras Duplicadas (5 tests pass)
✔ 19 tests passing (0 failing)
```

---

## 🛡️ Auditoría de Código y Estándares
Ejecuta la auditoría automatizada bajo las reglas de `backend-postgres-guardian`:
```bash
npm run lint:backend
```
*Resultado: **0 errores***. Cumple con principios de 3FN, índices en todas las claves foráneas, transacciones atómicas y seguridad.

---

## 📡 Catálogo de Endpoints de la API

Base URL: `http://localhost:3000/api`

### 🔑 Autenticación
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/auth/login` | Inicia sesión con `correo` y `contrasena`, emite JWT (expira en 25m). | Público |
| `GET` | `/health` | Chequeo de salud del servicio y de la conexión a PostgreSQL. | Público |

> *Credenciales semilla de prueba:* `correo: admin@constructora.cr` \| `contrasena: Admin1234`

### 📦 Materiales e Inventario
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/materiales` | Lista todos los materiales calculando dinámicamente el stock actual, $SS$, $PR$ y estado (`ÓPTIMO`, `ALERTA_REORDEN`, `CRÍTICO`). |
| `POST` | `/materiales` | Registra un nuevo material en el catálogo validando código único y parámetros de demanda. |
| `GET` | `/materiales/:id` | Detalle de un material con sus métricas completas de inventario. |
| `GET` | `/materiales/:id/stock` | Retorna exclusivamente el balance de stock actual, stock de seguridad y punto de reorden. |
| `GET` | `/materiales/:id/historial` | **Trazabilidad completa**: movimientos históricos, usuario responsable, ubicaciones y orden de compra asociada para cada entrada. |

### 🔄 Movimientos de Inventario
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/movimientos` | Lista de todos los movimientos registrados con filtros opcionales por material y tipo. |
| `POST` | `/movimientos` | Registra una entrada, salida, traslado o ajuste. **Previene saldos negativos** mediante transacciones ACID (`SERIALIZABLE`). |

### ⚠️ Alertas de Reposición
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/alertas` | Filtra materiales cuyo $\text{Stock} \le PR$. Calcula la cantidad sugerida de reposición para alcanzar el stock máximo. |

### 🔍 Compras y Detección de Duplicados (Ejercicio A3)
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/ordenes/duplicados` | Detecta posibles órdenes duplicadas según 5 criterios cruzados. Acepta query params configurables: `?ventanaDias=7&margenCantidad=0.10`. |

---

## 🧮 Fórmulas y Reglas de Negocio Implementadas

### 1. Cálculo Dinámico de Stock
$$\text{Stock Actual} = \sum \text{Entradas} - \sum \text{Salidas} + \sum \text{Ajustes}$$
- Los **traslados** entre bodegas u obras reubican existencias sin alterar el saldo global de la empresa.
- Si una salida excede el stock disponible, la transacción se aborta con error `HTTP 400: Stock insuficiente`.

### 2. Stock de Seguridad ($SS$) y Punto de Reorden ($PR$)
- **Stock de Seguridad**:
  $$SS = (d_{\max} - d) \times L$$
- **Punto de Reorden**:
  $$PR = d \times L + SS = d_{\max} \times L$$
  *Donde $d$ = Demanda diaria promedio, $d_{\max}$ = Demanda máxima diaria, $L$ = Tiempo de entrega en días.*

### 3. Matriz de Estados de Inventario
- $\text{Stock} \le \text{Stock Mínimo} \implies$ **`CRÍTICO`** (Riesgo inminente de desabastecimiento en obra).
- $\text{Stock Mínimo} < \text{Stock} \le PR \implies$ **`ALERTA_REORDEN`** (Disparar orden de reabastecimiento).
- $\text{Stock} > PR \implies$ **`ÓPTIMO`** (Nivel de inventario adecuado).

### 4. Regla Algorítmica de Compras Duplicadas
Dos órdenes de compra se catalogan como **Posible Duplicado** si cumplen simultáneamente:
1. **Mismo Proveedor**: `orden1.id_proveedor == orden2.id_proveedor`
2. **Mismo Material**: `detalle1.id_material == detalle2.id_material`
3. **Fechas Cercanas**: $|\text{fecha}_1 - \text{fecha}_2| \le 7\text{ días}$
4. **Cantidad Similar**: $\frac{|\text{cant}_1 - \text{cant}_2|}{\max(\text{cant}_1, \text{cant}_2)} \le 10\%$
5. **Órdenes Activas**: Ninguna de las dos órdenes se encuentra en estado cancelado.

---

## 👤 Integrante 2 (Backend)
- **Rama Git**: `feature/Eiker`
- **Repositorio**: `https://github.com/alaniecastillo27fwd-glitch/QUIZ-2-.git`
