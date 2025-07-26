# Caso de Uso: Proceso de Compra Completo en E-Commerce

## Información General

**ID del Caso de Uso**: UC-001  
**Nombre**: Proceso de Compra Completo  
**Actor Principal**: Cliente Registrado  
**Nivel**: Objetivo del Usuario  
**Alcance**: Sistema E-Commerce Completo  
**Fecha**: 2024  

## Descripción

Este caso de uso describe el proceso completo que realiza un cliente registrado para comprar productos en el sistema de e-commerce, desde la navegación por el catálogo hasta la confirmación de la orden.

## Actores

### Actor Principal
- **Cliente Registrado**: Usuario autenticado que desea realizar una compra

### Actores Secundarios
- **Sistema de Autenticación**: Valida la identidad del usuario
- **Sistema de Productos**: Proporciona información del catálogo
- **Sistema de Carrito**: Gestiona los productos seleccionados
- **Sistema de Órdenes**: Procesa y registra las compras

## Precondiciones

1. El cliente debe estar registrado en el sistema
2. El cliente debe estar autenticado (login exitoso)
3. Debe existir al menos un producto disponible en el catálogo
4. Los microserviios del sistema deben estar operativos

## Postcondiciones

### Postcondiciones de Éxito
1. Se crea una nueva orden en estado "pending"
2. Los productos se registran como items de la orden
3. El carrito del usuario se vacía automáticamente
4. Se actualiza el stock de los productos comprados
5. El usuario recibe confirmación de la compra

### Postcondiciones de Fallo
1. El carrito mantiene los productos seleccionados
2. No se afecta el stock de productos
3. No se crea ninguna orden
4. Se muestra mensaje de error apropiado

## Flujo Básico de Eventos

### 1. Autenticación del Usuario
1. El cliente accede al sistema a través del frontend (http://localhost:5173)
2. Si no está autenticado, el sistema redirige a la página de login
3. El cliente ingresa sus credenciales (username y password)
4. El sistema valida las credenciales mediante el **Auth Service** (puerto 8000)
5. Si las credenciales son válidas, se genera un token JWT
6. El token se almacena en localStorage del navegador
7. El cliente es redirigido a la página principal de productos

### 2. Navegación y Selección de Productos
1. El sistema carga la lista de productos desde el **Product Service** (puerto 8001)
2. Se muestran los productos con información completa:
   - Nombre y descripción
   - Imagen del producto
   - Precio unitario con IVA
   - Categoría, tamaño y peso
   - Stock disponible
3. El cliente navega por el catálogo y revisa los productos disponibles
4. El cliente selecciona productos de interés

### 3. Adición de Productos al Carrito
1. Para cada producto deseado, el cliente:
   - Selecciona la cantidad usando los controles +/-
   - Hace clic en "Agregar al Carrito"
2. El sistema valida que haya stock suficiente
3. Se envía la petición al **Cart Service** (puerto 8002) con:
   - Token de autenticación en header Authorization
   - ID del producto
   - Cantidad seleccionada
   - Precio unitario actual
4. El Cart Service valida el token con el Auth Service
5. Se agrega el item al carrito en la base de datos
6. El contador de carrito en la navegación se actualiza
7. Se muestra confirmación visual al usuario

### 4. Revisión del Carrito
1. El cliente hace clic en "🛒 Carrito" en la navegación
2. El sistema carga todos los items del carrito desde Cart Service
3. Se muestra la lista detallada con:
   - Información de cada producto
   - Cantidad y precio unitario
   - Subtotal por producto
   - Total general de la compra
4. El cliente puede:
   - Revisar los productos seleccionados
   - Eliminar productos no deseados
   - Continuar comprando (volver al catálogo)

### 5. Proceso de Checkout
1. El cliente decide proceder con la compra
2. Se presenta un formulario con campos obligatorios:
   - Dirección de envío
   - Teléfono de contacto
   - Email de confirmación
   - Notas adicionales (opcional)
3. El cliente completa la información requerida
4. Hace clic en "Confirmar Compra"

### 6. Creación de la Orden
1. El sistema valida la información proporcionada
2. Se envía petición al **Order Service** (puerto 8003) con:
   - Token de autenticación
   - Información de envío y contacto
   - Notas adicionales
3. El Order Service ejecuta el proceso:
   - Valida el token con Auth Service
   - Obtiene los items del carrito vía Cart Service
   - Obtiene información de productos vía Product Service
   - Calcula el total de la orden
   - Crea la orden en base de datos
   - Crea los order_items con snapshot de productos
   - Limpia el carrito del usuario
4. Se genera un ID único para la orden

### 7. Confirmación y Finalización
1. El sistema muestra página de confirmación con:
   - Número de orden generado
   - Resumen de productos comprados
   - Total pagado
   - Información de envío
   - Estado inicial: "Pendiente"
2. Se actualiza el contador del carrito a 0
3. El cliente puede continuar navegando o cerrar sesión

## Flujos Alternativos

### A1: Error de Autenticación
- **Punto de bifurcación**: Paso 1.4
- **Condición**: Credenciales inválidas
- **Flujo**:
  1. El sistema muestra mensaje "Credenciales inválidas"
  2. El cliente puede intentar nuevamente
  3. Después de 3 intentos fallidos, se sugiere registro
  4. Regresa al paso 1.3 del flujo básico

### A2: Producto sin Stock
- **Punto de bifurcación**: Paso 3.2
- **Condición**: Stock insuficiente para la cantidad solicitada
- **Flujo**:
  1. El sistema muestra mensaje "Stock insuficiente"
  2. Se sugiere cantidad máxima disponible
  3. El cliente puede ajustar la cantidad o cancelar
  4. Regresa al paso 3.1 del flujo básico

### A3: Token Expirado Durante la Compra
- **Punto de bifurcación**: Cualquier petición autenticada
- **Condición**: Token JWT ha expirado
- **Flujo**:
  1. El sistema detecta token inválido/expirado
  2. Se redirige automáticamente al login
  3. Después del login exitoso, se redirige de vuelta
  4. El carrito se preserva por user_id
  5. Continúa desde donde se interrumpió

### A4: Error en Creación de Orden
- **Punto de bifurcación**: Paso 6.3
- **Condición**: Falla en el Order Service
- **Flujo**:
  1. Se muestra mensaje de error técnico
  2. El carrito se preserva intacto
  3. Se sugiere intentar nuevamente
  4. Si persiste, se muestra información de contacto
  5. Regresa al paso 5.4 del flujo básico

## Flujos de Excepción

### E1: Servicio No Disponible
- **Condición**: Cualquier microservicio no responde
- **Manejo**:
  1. Se muestra mensaje de mantenimiento
  2. Se sugiere intentar más tarde
  3. Se preserva el estado de la sesión
  4. Se registra el error para monitoreo

### E2: Pérdida de Conexión
- **Condición**: El cliente pierde conectividad
- **Manejo**:
  1. El frontend detecta la desconexión
  2. Se muestra indicador de "Sin conexión"
  3. Al recuperar conexión, se reintenta automáticamente
  4. Se sincroniza el estado del carrito

## Requerimientos Especiales

### Requerimientos de Rendimiento
- Tiempo de respuesta máximo: 3 segundos por operación
- Carga de productos: < 2 segundos
- Actualización de carrito: < 1 segundo
- Creación de orden: < 5 segundos

### Requerimientos de Seguridad
- Todas las comunicaciones usan tokens JWT
- Validación de autorización en cada microservicio
- Encriptación de contraseñas con bcrypt
- Validación de datos de entrada

### Requerimientos de Usabilidad
- Interfaz responsive para móvil y desktop
- Indicadores visuales de progreso
- Mensajes de error claros y accionables
- Navegación intuitiva

## Datos Utilizados

### Entradas del Usuario
- **Credenciales**: username (varchar 50), password (varchar 100)
- **Selección de productos**: product_id (int), quantity (int)
- **Información de envío**: 
  - shipping_address (text)
  - phone (varchar 20)
  - email (varchar 100)
  - notes (text, opcional)

### Datos del Sistema
- **Producto**: id, name, description, unit_price, iva, stock_quantity
- **Usuario**: id, username (del token)
- **Carrito**: user_id, product_id, quantity, unit_price
- **Orden**: id, user_id, total_amount, status, timestamps

## Frecuencia de Uso

- **Frecuencia esperada**: 50-100 órdenes por día
- **Usuarios concurrentes**: 10-20 usuarios simultáneos
- **Pico de uso**: Fines de semana y horarios de oficina

## Problemas Abiertos

1. **Gestión de inventario**: ¿Cómo manejar productos reservados durante el checkout?
2. **Pagos**: Integración con pasarela de pagos (no implementado)
3. **Notificaciones**: Sistema de notificaciones por email
4. **Logística**: Integración con sistemas de envío

## Casos de Prueba Sugeridos

### Caso de Prueba 1: Compra Exitosa
- **Precondición**: Usuario autenticado, productos con stock
- **Pasos**: Seguir flujo básico completo
- **Resultado esperado**: Orden creada exitosamente

### Caso de Prueba 2: Compra con Stock Limitado
- **Precondición**: Producto con stock = 1, usuario intenta comprar 2
- **Pasos**: Intentar agregar 2 unidades al carrito
- **Resultado esperado**: Error de stock insuficiente

### Caso de Prueba 3: Token Expirado
- **Precondición**: Usuario autenticado con token próximo a expirar
- **Pasos**: Realizar compra cuando el token expire
- **Resultado esperado**: Re-autenticación automática

### Caso de Prueba 4: Carrito Múltiples Productos
- **Precondición**: Varios productos disponibles
- **Pasos**: Agregar múltiples productos con diferentes cantidades
- **Resultado esperado**: Orden con todos los productos correctos

## Trazabilidad

### Requerimientos Relacionados
- RF-001: Autenticación de usuarios
- RF-002: Gestión de catálogo de productos
- RF-003: Carrito de compras
- RF-004: Procesamiento de órdenes
- RNF-001: Rendimiento del sistema
- RNF-002: Seguridad de datos

### Casos de Uso Relacionados
- UC-002: Gestión de Catálogo de Productos
- UC-003: Autenticación de Usuarios
- UC-004: Administración de Órdenes

## Notas Adicionales

Este caso de uso representa el flujo principal de negocio del sistema e-commerce. Su correcta implementación es crítica para el éxito del proyecto, ya que incluye la interacción entre todos los microservicios del sistema (Auth, Product, Cart, Order) y el frontend React.

La arquitectura de microservicios permite que cada componente pueda fallar independientemente sin afectar todo el sistema, proporcionando mayor robustez y escalabilidad.