
-- ==========================================
-- SISTEMA DE INVENTARIOS PARA CONSTRUCTORA
-- Base de datos: inventario_constructora
-- ==========================================

BEGIN;

-- 1. TABLA DE MATERIALES

CREATE TABLE materiales (
    id_material INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    unidad_medida VARCHAR(20) NOT NULL,
    stock_minimo NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock_maximo NUMERIC(12,2) NOT NULL,
    demanda_promedio NUMERIC(12,2) NOT NULL DEFAULT 0,
    demanda_maxima NUMERIC(12,2) NOT NULL DEFAULT 0,
    tiempo_entrega INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_stock CHECK (
        stock_minimo >= 0
        AND stock_maximo >= stock_minimo
    ),
    CONSTRAINT chk_demanda CHECK (
        demanda_promedio >= 0
        AND demanda_maxima >= demanda_promedio
        AND tiempo_entrega >= 0
    )
);

-- 2. TABLA DE UBICACIONES

CREATE TABLE ubicaciones (
    id_ubicacion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL,
    direccion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_tipo_ubicacion
        CHECK (tipo IN ('BODEGA', 'OBRA'))
);

-- 3. TABLA DE USUARIOS

CREATE TABLE usuarios (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    rol VARCHAR(30) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. TABLA DE PROVEEDORES

CREATE TABLE proveedores (
    id_proveedor INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(30),
    correo VARCHAR(150),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5. TABLA DE ORDENES DE COMPRA

CREATE TABLE ordenes_compra (
    id_orden INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_orden VARCHAR(30) NOT NULL UNIQUE,
    id_proveedor INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    fecha_orden DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    observaciones TEXT,

    FOREIGN KEY (id_proveedor)
        REFERENCES proveedores(id_proveedor),

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT chk_estado_orden CHECK (
        estado IN (
            'PENDIENTE',
            'APROBADA',
            'RECIBIDA',
            'CANCELADA'
        )
    )
);

-- 6. DETALLES DE ORDENES DE COMPRA

CREATE TABLE detalle_orden_compra (
    id_detalle INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_orden INTEGER NOT NULL,
    id_material INTEGER NOT NULL,
    cantidad NUMERIC(12,2) NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,

    FOREIGN KEY (id_orden)
        REFERENCES ordenes_compra(id_orden),

    FOREIGN KEY (id_material)
        REFERENCES materiales(id_material),

    CONSTRAINT chk_detalle_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT chk_detalle_precio
        CHECK (precio_unitario >= 0)
);

-- 7. MOVIMIENTOS DE INVENTARIO

CREATE TABLE movimientos (
    id_movimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_material INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL,
    cantidad NUMERIC(12,2) NOT NULL,
    fecha_movimiento TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    id_ubicacion_origen INTEGER,
    id_ubicacion_destino INTEGER,

    id_detalle_orden INTEGER,
    documento_referencia VARCHAR(60) NOT NULL,
    observaciones TEXT,

    FOREIGN KEY (id_material)
        REFERENCES materiales(id_material),

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    FOREIGN KEY (id_ubicacion_origen)
        REFERENCES ubicaciones(id_ubicacion),

    FOREIGN KEY (id_ubicacion_destino)
        REFERENCES ubicaciones(id_ubicacion),

    FOREIGN KEY (id_detalle_orden)
        REFERENCES detalle_orden_compra(id_detalle),

    CONSTRAINT chk_movimiento_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT chk_tipo_movimiento CHECK (
        tipo_movimiento IN (
            'ENTRADA',
            'SALIDA',
            'TRASLADO',
            'AJUSTE_ENTRADA',
            'AJUSTE_SALIDA'
        )
    ),

    CONSTRAINT chk_ubicaciones_movimiento CHECK (
        (
            tipo_movimiento IN ('ENTRADA', 'AJUSTE_ENTRADA')
            AND id_ubicacion_origen IS NULL
            AND id_ubicacion_destino IS NOT NULL
        )
        OR
        (
            tipo_movimiento IN ('SALIDA', 'AJUSTE_SALIDA')
            AND id_ubicacion_origen IS NOT NULL
            AND id_ubicacion_destino IS NULL
        )
        OR
        (
            tipo_movimiento = 'TRASLADO'
            AND id_ubicacion_origen IS NOT NULL
            AND id_ubicacion_destino IS NOT NULL
            AND id_ubicacion_origen <> id_ubicacion_destino
        )
    ),

    CONSTRAINT chk_entrada_oc CHECK (
        id_detalle_orden IS NULL
        OR tipo_movimiento = 'ENTRADA'
    )
);

-- INDICES PARA CONSULTAS FRECUENTES

CREATE INDEX idx_movimientos_material
    ON movimientos(id_material);

CREATE INDEX idx_movimientos_fecha
    ON movimientos(fecha_movimiento);

CREATE INDEX idx_ordenes_proveedor_fecha
    ON ordenes_compra(id_proveedor, fecha_orden);

COMMIT;

-- INSERTS DE MATERIALES

INSERT INTO materiales (
    codigo,
    nombre,
    descripcion,
    unidad_medida,
    stock_minimo,
    stock_maximo,
    demanda_promedio,
    demanda_maxima,
    tiempo_entrega
)
VALUES
(
    'MAT-001',
    'Cemento gris 50 kg',
    'Saco de cemento para construcción',
    'sacos',
    100,
    500,
    40,
    55,
    3
),
(
    'MAT-002',
    'Varilla #3',
    'Varilla de acero para construcción',
    'unidades',
    400,
    2000,
    120,
    160,
    5
),
(
    'MAT-003',
    'Block 12x20x40',
    'Bloque de concreto',
    'unidades',
    1000,
    5000,
    600,
    900,
    4
),
(
    'MAT-004',
    'Arena',
    'Arena para construcción',
    'm3',
    10,
    50,
    6,
    10,
    2
);

SELECT * FROM materiales;


-- INSERTS DE UBICACIONES

INSERT INTO ubicaciones (
    nombre,
    tipo,
    direccion
)
VALUES
(
    'Bodega Central',
    'BODEGA',
    'San José, Costa Rica'
),
(
    'Obra Norte',
    'OBRA',
    'Heredia, Costa Rica'
),
(
    'Obra Sur',
    'OBRA',
    'Cartago, Costa Rica'
);

SELECT * FROM ubicaciones;

-- INSERTS DE USUARIOS

INSERT INTO usuarios (
    nombre,
    correo,
    rol
)
VALUES
(
    'Andres Perez',
    'andres@example.com',
    'ADMINISTRADOR'
),
(
    'Encargado Bodega',
    'bodega@example.com',
    'BODEGUERO'
),
(
    'Encargado Compras',
    'compras@example.com',
    'COMPRAS'
);

SELECT * FROM usuarios;

-- INSERTS DE PROVEEDORES

INSERT INTO proveedores (
    nombre,
    telefono,
    correo
)
VALUES
(
    'Proveedor A',
    '2222-1111',
    'proveedora@example.com'
),
(
    'Proveedor B',
    '2222-2222',
    'proveedorb@example.com'
),
(
    'Proveedor C',
    '2222-3333',
    'proveedorc@example.com'
);

SELECT * FROM proveedores;

--INSERTS DE MOVIMIENTOS


INSERT INTO movimientos (
    id_material,
    id_usuario,
    tipo_movimiento,
    cantidad,
    id_ubicacion_destino,
    documento_referencia,
    observaciones
)
SELECT
    m.id_material,
    u.id_usuario,
    'ENTRADA',
    datos.cantidad,
    b.id_ubicacion,
    'INVENTARIO-INICIAL',
    'Carga inicial del ejercicio A5'
FROM (
    VALUES
        ('MAT-001', 190.00),
        ('MAT-002', 850.00),
        ('MAT-003', 2800.00),
        ('MAT-004', 14.00)
) AS datos(codigo, cantidad)
JOIN materiales m
    ON m.codigo = datos.codigo
CROSS JOIN (
    SELECT id_usuario
    FROM usuarios
    WHERE correo = 'andres@example.com'
) u
CROSS JOIN (
    SELECT id_ubicacion
    FROM ubicaciones
    WHERE nombre = 'Bodega Central'
) b;

SELECT * FROM movimientos;

-- VISTA DE EXISTENCIAS

CREATE VIEW vista_stock AS
WITH movimientos_stock AS (

    SELECT
        id_material,
        id_ubicacion_destino AS id_ubicacion,
        cantidad AS cambio
    FROM movimientos
    WHERE id_ubicacion_destino IS NOT NULL

    UNION ALL

    SELECT
        id_material,
        id_ubicacion_origen AS id_ubicacion,
        -cantidad AS cambio
    FROM movimientos
    WHERE id_ubicacion_origen IS NOT NULL

)

SELECT
    m.id_material,
    m.codigo,
    m.nombre AS material,
    u.id_ubicacion,
    u.nombre AS ubicacion,
    COALESCE(SUM(ms.cambio), 0) AS stock_actual

FROM materiales m

CROSS JOIN ubicaciones u

LEFT JOIN movimientos_stock ms
    ON ms.id_material = m.id_material
    AND ms.id_ubicacion = u.id_ubicacion

GROUP BY
    m.id_material,
    m.codigo,
    m.nombre,
    u.id_ubicacion,
    u.nombre;


SELECT *
FROM vista_stock
WHERE stock_actual <> 0;

--VISTA DE ALERTAS

CREATE VIEW vista_alertas_reorden AS
WITH stock_total AS (
    SELECT
        id_material,
        SUM(stock_actual) AS stock_actual
    FROM vista_stock
    GROUP BY id_material
),
calculos AS (
    SELECT
        m.id_material,
        m.nombre AS material,
        s.stock_actual,
        (
            m.demanda_maxima - m.demanda_promedio
        ) * m.tiempo_entrega AS stock_seguridad,
        (
            m.demanda_promedio * m.tiempo_entrega
            +
            (
                m.demanda_maxima - m.demanda_promedio
            ) * m.tiempo_entrega
        ) AS punto_reorden

    FROM materiales m

    JOIN stock_total s
        ON s.id_material = m.id_material
)

SELECT
    *,
    CASE
        WHEN stock_actual < punto_reorden
            THEN 'REORDENAR'
        ELSE 'SUFICIENTE'
    END AS estado

FROM calculos;


SELECT * FROM vista_alertas_reorden;

-- PRUEBA DE MOVIMIENTO REAL

INSERT INTO movimientos (
    id_material,
    id_usuario,
    tipo_movimiento,
    cantidad,
    id_ubicacion_origen,
    documento_referencia,
    observaciones
)
SELECT
    m.id_material,
    u.id_usuario,
    'SALIDA',
    50,
    b.id_ubicacion,
    'VALE-001',
    'Salida de cemento para uso en obra'
FROM materiales m
CROSS JOIN usuarios u
CROSS JOIN ubicaciones b
WHERE m.codigo = 'MAT-001'
  AND u.correo = 'andres@example.com'
  AND b.nombre = 'Bodega Central';


SELECT *
FROM vista_stock
WHERE codigo = 'MAT-001';

SELECT *
FROM vista_alertas_reorden
WHERE id_material = 1;