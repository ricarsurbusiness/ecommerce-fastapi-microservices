# E-commerce Microservices Application

Aplicación de e-commerce completa construida con arquitectura de microservicios, utilizando FastAPI para el backend y React para el frontend.

## 🏗️ Arquitectura

### Backend (Microservicios)
- **Auth Service**: Autenticación y autorización de usuarios
- **Product Service**: Gestión del catálogo de productos  
- **Cart Service**: Manejo del carrito de compras
- **Order Service**: Procesamiento de órdenes
- **Gateway**: API Gateway para enrutamiento

### Frontend
- **React + Vite**: Interfaz de usuario moderna y responsiva

### Base de Datos
- **MySQL 8.0**: Dos instancias separadas para auth y ecommerce

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker
- Docker Compose
- Node.js (para desarrollo del frontend)

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd Prueba_tecnica
```

### 2. Levantar el backend
```bash
docker-compose up -d
```

### 3. Configurar el frontend
```bash
cd src/frontend
npm install
npm run dev
```

## 📁 Estructura del Proyecto

```
Prueba_tecnica/
├── src/
│   ├── modules/              # Backend microservices
│   │   ├── auth_service/     # Servicio de autenticación
│   │   ├── product_service/  # Servicio de productos
│   │   ├── cart_service/     # Servicio de carrito
│   │   ├── order_service/    # Servicio de órdenes
│   │   └── gateway/          # API Gateway
│   └── frontend/             # Aplicación React
├── docker-compose.yml        # Configuración de servicios
└── README.md
```

## 🌐 URLs de Acceso

### Servicios Backend
- Auth Service: http://localhost:8000
- Product Service: http://localhost:8001  
- Cart Service: http://localhost:8002
- Order Service: http://localhost:8003

### Frontend
- React App: http://localhost:5173

### Base de Datos
- Auth DB: localhost:3306
- Ecommerce DB: localhost:3307

## 🛠️ Tecnologías

### Backend
- **FastAPI**: Framework web moderno para Python
- **SQLAlchemy**: ORM para Python
- **MySQL**: Base de datos relacional
- **JWT**: Autenticación basada en tokens
- **Docker**: Containerización

### Frontend  
- **React**: Biblioteca de JavaScript para UI
- **Vite**: Herramienta de build rápida
- **ESLint**: Linter para JavaScript

## 📋 Funcionalidades

- ✅ Registro y login de usuarios
- ✅ Gestión de productos (CRUD)
- ✅ Carrito de compras
- ✅ Procesamiento de órdenes
- ✅ Autenticación JWT
- ✅ Arquitectura de microservicios
- ✅ Containerización con Docker

## 🔧 Desarrollo

### Backend
Cada microservicio puede desarrollarse independientemente. Ver `src/modules/README.md` para más detalles.

### Frontend
```bash
cd src/frontend
npm run dev     # Servidor de desarrollo
npm run build   # Build para producción
npm run preview # Preview del build
```

## 📝 Documentación API

Una vez levantados los servicios, la documentación interactiva está disponible en:
- Auth Service: http://localhost:8000/docs
- Product Service: http://localhost:8001/docs
- Cart Service: http://localhost:8002/docs
- Order Service: http://localhost:8003/docs

## 🐳 Docker

### Comandos útiles
```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Rebuild servicios
docker-compose up --build
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.