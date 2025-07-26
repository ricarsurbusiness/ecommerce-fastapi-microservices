-- ==================================================
-- SCRIPT DE BASE DE DATOS - SISTEMA E-COMMERCE
-- Descripción: Script para crear las bases de datos y tablas del sistema de microservicios
-- Fecha: 2024
-- ==================================================

-- Crear las bases de datos
CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==================================================
-- BASE DE DATOS DE AUTENTICACIÓN (auth_db)
-- ==================================================

USE auth_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB;

-- Insertar usuarios de prueba (contraseñas hasheadas con bcrypt)
INSERT INTO users (username, password) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewsBdCuFxmGn0Kq6'), -- password: admin123
('usuario1', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'), -- password: secret
('testuser', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: password

-- ==================================================
-- BASE DE DATOS PRINCIPAL (ecommerce_db)
-- ==================================================

USE ecommerce_db;

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    size VARCHAR(50),
    weight DECIMAL(10,3),
    unit_price DECIMAL(10,2) NOT NULL,
    iva DECIMAL(5,2) NOT NULL DEFAULT 19.00,
    category_id INT,
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Tabla de items del carrito
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    UNIQUE KEY unique_user_product (user_id, product_id)
) ENGINE=InnoDB;

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
           DEFAULT 'pending' NOT NULL,
    shipping_address TEXT NOT NULL,
    billing_address TEXT,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    notes TEXT,
    estimated_delivery DATETIME,
    delivered_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Tabla de items de órdenes
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB;

-- ==================================================
-- DATOS DE PRUEBA
-- ==================================================

-- Insertar categorías
INSERT INTO categories (name, description) VALUES
('Electrónicos', 'Dispositivos electrónicos y gadgets'),
('Ropa', 'Vestimenta y accesorios'),
('Hogar', 'Artículos para el hogar y decoración'),
('Deportes', 'Equipamiento deportivo y fitness'),
('Libros', 'Libros y material educativo');

-- Insertar productos de prueba
INSERT INTO products (name, description, image_url, size, weight, unit_price, iva, category_id, stock_quantity) VALUES
('Smartphone Samsung Galaxy', 'Teléfono inteligente con pantalla AMOLED de 6.1 pulgadas', 'https://via.placeholder.com/300x300', '6.1"', 0.174, 899999.00, 19.00, 1, 50),
('Laptop HP Pavilion', 'Laptop con procesador Intel i5, 8GB RAM, 256GB SSD', 'https://via.placeholder.com/300x300', '15.6"', 1.750, 1299999.00, 19.00, 1, 25),
('Camiseta Nike Deportiva', 'Camiseta deportiva de algodón premium', 'https://via.placeholder.com/300x300', 'M', 0.200, 89999.00, 19.00, 2, 100),
('Sofá de 3 Puestos', 'Sofá cómodo para sala de estar', 'https://via.placeholder.com/300x300', '200x90x85cm', 45.000, 799999.00, 19.00, 3, 10),
('Balón de Fútbol', 'Balón oficial FIFA para fútbol profesional', 'https://via.placeholder.com/300x300', 'Talla 5', 0.450, 129999.00, 19.00, 4, 75),
('El Principito', 'Libro clásico de Antoine de Saint-Exupéry', 'https://via.placeholder.com/300x300', '19x12cm', 0.180, 25999.00, 0.00, 5, 200),
('Auriculares Bluetooth', 'Auriculares inalámbricos con cancelación de ruido', 'https://via.placeholder.com/300x300', 'Universal', 0.250, 199999.00, 19.00, 1, 80),
('Jeans Levis 501', 'Jeans clásicos de mezclilla azul', 'https://via.placeholder.com/300x300', '32x34', 0.650, 149999.00, 19.00, 2, 60),
('Mesa de Centro', 'Mesa de centro de madera maciza', 'https://via.placeholder.com/300x300', '120x60x45cm', 25.000, 299999.00, 19.00, 3, 15),
('Raqueta de Tenis', 'Raqueta profesional de tenis', 'https://via.placeholder.com/300x300', '27 pulgadas', 0.320, 249999.00, 19.00, 4, 30);

-- Insertar algunos items en el carrito para pruebas
INSERT INTO cart_items (user_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 899999.00),
(1, 3, 2, 89999.00),
(2, 2, 1, 1299999.00),
(2, 6, 3, 25999.00);

-- Insertar una orden de prueba
INSERT INTO orders (user_id, total_amount, status, shipping_address, phone, email, notes) VALUES
(1, 1079997.00, 'pending', 'Calle 123 #45-67, Bogotá, Colombia', '+57 300 123 4567', 'usuario1@example.com', 'Entregar en horario de oficina');

-- Insertar items de la orden
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, product_name, product_description) VALUES
(1, 1, 1, 899999.00, 899999.00, 'Smartphone Samsung Galaxy', 'Teléfono inteligente con pantalla AMOLED de 6.1 pulgadas'),
(1, 3, 2, 89999.00, 179998.00, 'Camiseta Nike Deportiva', 'Camiseta deportiva de algodón premium');

-- ==================================================
-- VISTAS ÚTILES
-- ==================================================

-- Vista para productos con información de categoría
CREATE VIEW v_products_with_category AS
SELECT
    p.id,
    p.name,
    p.description,
    p.image_url,
    p.size,
    p.weight,
    p.unit_price,
    p.iva,
    p.stock_quantity,
    p.is_active,
    c.name AS category_name,
    c.description AS category_description,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- Vista para resumen de carrito por usuario
CREATE VIEW v_cart_summary AS
SELECT
    ci.user_id,
    COUNT(ci.id) AS total_items,
    SUM(ci.quantity) AS total_quantity,
    SUM(ci.quantity * ci.unit_price) AS total_amount
FROM cart_items ci
GROUP BY ci.user_id;

-- Vista para órdenes con detalles
CREATE VIEW v_orders_detail AS
SELECT
    o.id AS order_id,
    o.user_id,
    o.total_amount,
    o.status,
    o.shipping_address,
    o.phone,
    o.email,
    o.created_at,
    COUNT(oi.id) AS total_items,
    SUM(oi.quantity) AS total_products
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.user_id, o.total_amount, o.status, o.shipping_address, o.phone, o.email, o.created_at;

-- ==================================================
-- PROCEDIMIENTOS ALMACENADOS
-- ==================================================

DELIMITER //

-- Procedimiento para limpiar carrito de un usuario
CREATE PROCEDURE sp_clear_user_cart(IN p_user_id INT)
BEGIN
    DELETE FROM cart_items WHERE user_id = p_user_id;
END //

-- Procedimiento para obtener resumen de carrito
CREATE PROCEDURE sp_get_cart_summary(IN p_user_id INT)
BEGIN
    SELECT
        ci.id,
        ci.product_id,
        p.name AS product_name,
        p.image_url,
        ci.quantity,
        ci.unit_price,
        (ci.quantity * ci.unit_price) AS total_price
    FROM cart_items ci
    INNER JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = p_user_id;
END //

-- Procedimiento para crear orden desde carrito
CREATE PROCEDURE sp_create_order_from_cart(
    IN p_user_id INT,
    IN p_shipping_address TEXT,
    IN p_phone VARCHAR(20),
    IN p_email VARCHAR(100),
    IN p_notes TEXT
)
BEGIN
    DECLARE v_order_id INT;
    DECLARE v_total_amount DECIMAL(12,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Calcular total del carrito
    SELECT SUM(quantity * unit_price) INTO v_total_amount
    FROM cart_items
    WHERE user_id = p_user_id;

    -- Crear la orden
    INSERT INTO orders (user_id, total_amount, shipping_address, phone, email, notes)
    VALUES (p_user_id, v_total_amount, p_shipping_address, p_phone, p_email, p_notes);

    SET v_order_id = LAST_INSERT_ID();

    -- Copiar items del carrito a la orden
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, product_name, product_description)
    SELECT
        v_order_id,
        ci.product_id,
        ci.quantity,
        ci.unit_price,
        (ci.quantity * ci.unit_price),
        p.name,
        p.description
    FROM cart_items ci
    INNER JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = p_user_id;

    -- Limpiar carrito
    DELETE FROM cart_items WHERE user_id = p_user_id;

    COMMIT;

    SELECT v_order_id AS order_id;
END //

DELIMITER ;

-- ==================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ==================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_cart_user_product ON cart_items(user_id, product_id);
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);

-- ==================================================
-- TRIGGERS PARA AUDITORÍA Y LÓGICA DE NEGOCIO
-- ==================================================

DELIMITER //

-- Trigger para actualizar stock cuando se crea una orden
CREATE TRIGGER tr_update_stock_on_order
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
END //

-- Trigger para validar stock antes de agregar al carrito
CREATE TRIGGER tr_validate_stock_cart
BEFORE INSERT ON cart_items
FOR EACH ROW
BEGIN
    DECLARE v_stock INT;

    SELECT stock_quantity INTO v_stock
    FROM products
    WHERE id = NEW.product_id AND is_active = TRUE;

    IF v_stock IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Producto no encontrado o inactivo';
    END IF;

    IF v_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente';
    END IF;
END //

DELIMITER ;

-- ==================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ==================================================

/*
DESCRIPCIÓN DE LAS TABLAS:

1. auth_db.users: Almacena información de usuarios para autenticación
   - Contraseñas hasheadas con bcrypt
   - Username único para login

2. ecommerce_db.categories: Categorías de productos
   - Estructura simple con nombre y descripción

3. ecommerce_db.products: Catálogo de productos
   - Información completa del producto incluyendo precio, IVA, stock
   - Relación con categorías (opcional)
   - Control de productos activos/inactivos

4. ecommerce_db.cart_items: Items en el carrito de compras
   - Relación usuario-producto con cantidad
   - Precio unitario almacenado al momento de agregar

5. ecommerce_db.orders: Órdenes de compra
   - Estados del pedido desde pending hasta delivered
   - Información completa de envío y contacto

6. ecommerce_db.order_items: Detalles de cada orden
   - Snapshot de la información del producto al momento de la compra
   - Precios y cantidades específicas

CARACTERÍSTICAS DE SEGURIDAD:
- Claves foráneas con restricciones apropiadas
- Triggers para validación de datos
- Índices para optimización de consultas
- Procedimientos almacenados para operaciones complejas
- Vistas para consultas frecuentes

ESCALABILIDAD:
- Uso de InnoDB para soporte de transacciones
- Índices optimizados para consultas frecuentes
- Estructura preparada para auditoría y logs
- Separación de bases de datos por dominio (auth vs ecommerce)
*/
