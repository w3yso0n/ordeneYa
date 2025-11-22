-- Database schema for OrdenEya
-- Compatible with TypeORM backend structure

-- Create database (run this separately if needed)
-- CREATE DATABASE IF NOT EXISTS ordeneya;
-- USE ordeneya;

-- Productos table
CREATE TABLE IF NOT EXISTS productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  imagen VARCHAR(500),
  opciones JSON NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pedidos table
CREATE TABLE IF NOT EXISTS pedidos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clienteNombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'RECIBIDO',
  metodoPago VARCHAR(50) NULL,
  total DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pedido items table
CREATE TABLE IF NOT EXISTS pedido_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pedidoId INT NOT NULL,
  productoId INT NOT NULL,
  cantidad INT NOT NULL,
  precioUnitario DECIMAL(10,2) NOT NULL,
  notas TEXT,
  opcionesSeleccionadas JSON NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pedidoId) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (productoId) REFERENCES productos(id)
);

-- Sample data for productos
INSERT INTO productos (nombre, precio, imagen) VALUES
('Tacos al Pastor', 45.00, NULL),
('Quesadillas', 35.00, NULL),
('Enchiladas', 55.00, NULL),
('Pozole', 65.00, NULL),
('Torta Cubana', 50.00, NULL),
('Agua de Horchata', 20.00, NULL);
