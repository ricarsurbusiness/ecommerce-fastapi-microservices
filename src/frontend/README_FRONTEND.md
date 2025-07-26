# Frontend E-Commerce App

Este es el frontend de la aplicación de e-commerce construida con React y Vite.

## 🚀 Características

- **Autenticación**: Login y registro de usuarios
- **Catálogo de productos**: Visualización de productos con detalles
- **Carrito de compras**: Agregar, eliminar y gestionar productos
- **Navegación intuitiva**: Interfaz moderna y responsiva
- **Actualización en tiempo real**: Contador de carrito actualizado automáticamente

## 📦 Tecnologías Utilizadas

- **React 19** - Framework de JavaScript
- **Vite** - Build tool y desarrollo
- **React Router DOM** - Navegación
- **Axios** - Cliente HTTP (en dependencias dev)
- **CSS3** - Estilos modernos con Flexbox/Grid

## 🛠️ Instalación y Configuración

### 1. Instalar dependencias

```bash
cd src/frontend
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y configura las URLs de los microservicios:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
# API URLs
VITE_AUTH_API=http://localhost:8000/auth
VITE_PRODUCT_API=http://localhost:8001/products
VITE_CART_API=http://localhost:8002/api/cart

# App Configuration
VITE_APP_TITLE=E-Commerce App
VITE_APP_VERSION=1.0.0

# Development
VITE_DEV_MODE=true
```

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### 4. Construir para producción

```bash
npm run build
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── Cart.jsx         # Componente del carrito
│   ├── Cart.css         # Estilos del carrito
│   ├── LoginForm.jsx    # Formulario de login
│   ├── Navigation.jsx   # Barra de navegación
│   ├── Navigation.css   # Estilos de navegación
│   ├── ProductList.jsx  # Lista de productos
│   ├── ProductList.css  # Estilos de productos
│   ├── RegisterForm.jsx # Formulario de registro
│   ├── Shop.jsx         # Componente principal de la tienda
│   └── Shop.css         # Estilos de la tienda
├── services/            # Servicios API
│   ├── authService.js   # Autenticación
│   ├── cartService.js   # Carrito de compras
│   └── productService.js # Productos
├── App.jsx              # Componente principal
├── App.css              # Estilos de la app
├── index.css            # Estilos globales
└── main.jsx             # Punto de entrada
```

## 🎯 Uso de la Aplicación

### 1. Autenticación

**Registro de usuario:**
- Ve a `/register`
- Completa el formulario con username y password
- Haz clic en "Registrarse"

**Inicio de sesión:**
- Ve a `/login`
- Ingresa tus credenciales
- Haz clic en "Iniciar Sesión"

### 2. Navegación

Una vez autenticado, podrás navegar entre:
- **📦 Productos**: Ver catálogo y agregar al carrito
- **🛒 Carrito**: Gestionar productos del carrito

### 3. Gestión de Productos

**Ver productos:**
- Los productos se muestran en tarjetas con información detallada
- Precio, descripción, categoría, peso, tamaño, etc.

**Agregar al carrito:**
- Selecciona la cantidad deseada
- Haz clic en "Agregar al Carrito"
- El precio se obtiene automáticamente del backend

### 4. Gestión del Carrito

**Ver carrito:**
- Lista de todos los productos agregados
- Muestra cantidad, precio unitario y total por producto
- Resumen con totales generales

**Eliminar productos:**
- Haz clic en "🗑️ Eliminar" en cualquier producto
- Confirma la eliminación

**Resumen del carrito:**
- Total de productos diferentes
- Total de artículos
- Monto total a pagar

## 🔧 APIs Utilizadas

### Auth Service (Puerto 8000)
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `GET /auth/verify-token` - Verificar token

### Product Service (Puerto 8001)
- `GET /products/` - Obtener todos los productos
- `GET /products/{id}` - Obtener producto por ID

### Cart Service (Puerto 8002)
- `GET /api/cart/` - Obtener items del carrito
- `POST /api/cart/` - Agregar producto al carrito
- `GET /api/cart/summary` - Obtener resumen del carrito
- `DELETE /api/cart/{item_id}` - Eliminar item del carrito

## 🎨 Características de la UI

### Diseño Responsivo
- **Desktop**: Layout de 3-4 columnas para productos
- **Tablet**: Layout de 2 columnas
- **Mobile**: Layout de 1 columna

### Navegación
- Barra de navegación fija en la parte superior
- Indicador visual del número de productos en el carrito
- Botón de cerrar sesión

### Productos
- Tarjetas con imagen, información detallada y precios
- Selector de cantidad con botones +/-
- Estados de loading al agregar al carrito
- Formateo de precios en pesos colombianos (COP)

### Carrito
- Vista detallada de cada producto
- Totales calculados automáticamente
- Confirmación antes de eliminar productos
- Botón para continuar comprando

## 🚨 Manejo de Errores

- **Autenticación fallida**: Mensajes de error claros
- **Productos no disponibles**: Manejo de errores de API
- **Carrito vacío**: Estado vacío con call-to-action
- **Conexión perdida**: Botones de reintentar

## 🔐 Seguridad

- **Tokens JWT**: Almacenados en localStorage
- **Rutas protegidas**: Redirige a login si no está autenticado
- **Headers de autorización**: Incluidos automáticamente en requests del carrito
- **Validación de tokens**: Verificación automática en el backend

## 📱 Responsive Design

La aplicación está optimizada para diferentes tamaños de pantalla:

- **Desktop (1200px+)**: Layout completo con sidebar
- **Tablet (768px-1199px)**: Layout adaptado
- **Mobile (320px-767px)**: Layout vertical optimizado

## 🎯 Próximas Características

- [ ] Búsqueda y filtros de productos
- [ ] Proceso de checkout completo
- [ ] Historial de órdenes
- [ ] Favoritos/Wishlist
- [ ] Notificaciones push
- [ ] Dark mode
- [ ] Internacionalización (i18n)

## 🐛 Solución de Problemas

### La aplicación no se conecta a los APIs
1. Verifica que los microservicios estén ejecutándose
2. Revisa las URLs en el archivo `.env`
3. Confirma que los puertos sean correctos

### Error de CORS
1. Los microservicios deben tener configurado CORS para `http://localhost:5173`
2. Verifica la configuración de middleware en los backends

### Token inválido
1. El token puede haber expirado - inicia sesión nuevamente
2. Verifica que la SECRET_KEY sea la misma en todos los servicios

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias, por favor:
1. Revisa la consola del navegador para errores
2. Verifica que todos los servicios backend estén funcionando
3. Consulta los logs de los microservicios

## 🚀 Deployment

Para desplegar en producción:

1. **Build de producción:**
   ```bash
   npm run build
   ```

2. **Configurar variables de entorno de producción**
3. **Servir archivos estáticos** con nginx, Apache, o similar
4. **Configurar HTTPS** para producción

---

¡Disfruta usando la aplicación de e-commerce! 🛍️