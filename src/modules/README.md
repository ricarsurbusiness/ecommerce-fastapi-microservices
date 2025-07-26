# Backend Microservices

Este directorio contiene todos los microservicios del backend de la aplicación de e-commerce, implementados con FastAPI y MySQL.

## Arquitectura

El backend está compuesto por los siguientes microservicios:

- **auth_service** (Puerto 8000): Manejo de autenticación y autorización de usuarios
- **product_service** (Puerto 8001): Gestión del catálogo de productos
- **cart_service** (Puerto 8002): Manejo del carrito de compras
- **order_service** (Puerto 8003): Procesamiento de órdenes
- **gateway**: API Gateway para enrutamiento de requests

## Tecnologías

- **Framework**: FastAPI
- **Base de datos**: MySQL 8.0
- **ORM**: SQLAlchemy
- **Contenedores**: Docker & Docker Compose
- **Autenticación**: JWT

## Configuración y Ejecución

### Prerrequisitos
- Docker
- Docker Compose

### Levantar todos los servicios
```bash
# Desde la raíz del proyecto
docker-compose up -d
```

### Verificar servicios
```bash
docker-compose ps
```

## URLs de los Servicios

- Auth Service: http://localhost:8000
- Product Service: http://localhost:8001
- Cart Service: http://localhost:8002
- Order Service: http://localhost:8003

## Base de Datos

El sistema utiliza dos bases de datos MySQL:

- **auth_db** (Puerto 3306): Base de datos de autenticación
- **ecommerce_db** (Puerto 3307): Base de datos principal del e-commerce

## Estructura de Cada Servicio

Cada microservicio sigue la misma estructura:

```
service_name/
├── app/
│   ├── __init__.py
│   ├── main.py          # Punto de entrada de FastAPI
│   ├── database.py      # Configuración de base de datos
│   ├── models.py        # Modelos SQLAlchemy
│   ├── schemas.py       # Esquemas Pydantic
│   ├── auth.py          # Utilidades de autenticación (si aplica)
│   └── routers/         # Endpoints organizados por funcionalidad
├── Dockerfile
├── requirements.txt
└── .env
```

## Comunicación Entre Servicios

Los servicios se comunican a través de HTTP usando URLs internas del contenedor:
- Auth verification en todos los servicios protegidos
- Cart service consulta auth service para validación
- Order service interactúa con cart, product y auth services

## Variables de Entorno

Cada servicio utiliza variables de entorno definidas en `docker-compose.yml`:
- Configuración de base de datos
- URLs de otros servicios
- Configuración JWT (SECRET_KEY, ALGORITHM)

## Logs y Monitoreo

Para ver logs de un servicio específico:
```bash
docker-compose logs -f service_name
```

Para ver logs de todos los servicios:
```bash
docker-compose logs -f
```
