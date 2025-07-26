# Instrucciones para generar el Diagrama UML de Base de Datos

## Descripción
Este archivo contiene las instrucciones para generar el diagrama UML de la base de datos del sistema de e-commerce a partir del archivo PlantUML.

## Archivo fuente
- **Archivo**: `02_database_uml.puml`
- **Formato**: PlantUML
- **Tipo**: Diagrama de base de datos relacional

## Métodos para generar el diagrama

### Opción 1: PlantUML Online (Recomendado)
1. Ve a [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. Copia el contenido completo del archivo `02_database_uml.puml`
3. Pégalo en el editor online
4. El diagrama se generará automáticamente
5. Puedes descargar la imagen en formato PNG, SVG o PDF

### Opción 2: Visual Studio Code con extensión
1. Instala la extensión "PlantUML" en VS Code
2. Abre el archivo `02_database_uml.puml`
3. Presiona `Alt + D` para ver la vista previa
4. Clic derecho → "Export Current Diagram" para guardar

### Opción 3: Línea de comandos (Java)
```bash
# Instalar PlantUML
java -jar plantuml.jar 02_database_uml.puml
```

### Opción 4: Docker
```bash
docker run --rm -v $(pwd):/data plantuml/plantuml:latest -tpng /data/02_database_uml.puml
```

## Descripción del diagrama

El diagrama UML muestra:

### Bases de datos
- **auth_db**: Base de datos de autenticación
- **ecommerce_db**: Base de datos principal de e-commerce

### Entidades principales
1. **User** (auth_db): Usuarios del sistema
2. **Category**: Categorías de productos
3. **Product**: Catálogo de productos
4. **CartItem**: Items en el carrito de compras
5. **Order**: Órdenes de compra
6. **OrderItem**: Detalles de cada orden

### Vistas incluidas
- `v_products_with_category`: Productos con información de categoría
- `v_cart_summary`: Resumen de carrito por usuario
- `v_orders_detail`: Órdenes con detalles agregados

### Procedimientos almacenados
- `sp_clear_user_cart`: Limpiar carrito de usuario
- `sp_get_cart_summary`: Obtener resumen de carrito
- `sp_create_order_from_cart`: Crear orden desde carrito

### Características del diseño
- **Separación de bases de datos**: Auth y e-commerce están separados siguiendo el patrón de microservicios
- **Relaciones bien definidas**: Claves foráneas con restricciones apropiadas
- **Índices optimizados**: Para mejorar el rendimiento de consultas
- **Integridad de datos**: Triggers y restricciones para validación
- **Escalabilidad**: Estructura preparada para crecimiento

### Colores y leyenda
- **Azul claro**: Tablas regulares
- **Amarillo claro**: Vistas de base de datos
- **Verde claro**: Procedimientos almacenados
- **Naranja**: Bases de datos

## Formatos de salida recomendados
- **PNG**: Para documentación y presentaciones
- **SVG**: Para documentación web (escalable)
- **PDF**: Para documentos formales

## Notas técnicas
- El diagrama incluye tipos de datos específicos para MySQL
- Se muestran índices principales y restricciones
- Las relaciones indican cardinalidad (uno a muchos, etc.)
- Se incluyen notas explicativas para elementos importantes

## Resolución de problemas
Si tienes problemas para generar el diagrama:
1. Verifica que el archivo `.puml` esté completo
2. Asegúrate de que la sintaxis PlantUML sea correcta
3. Usa la opción online si tienes problemas locales
4. Revisa que no haya caracteres especiales que causen errores

## Personalización
Puedes modificar el archivo `.puml` para:
- Cambiar colores y estilos
- Agregar o quitar elementos
- Modificar el layout del diagrama
- Agregar más detalles o notas explicativas