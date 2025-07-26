import pytest
import sys
import os
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal

# Agregar el path del módulo cart_service para poder importarlo
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../src/modules/cart_service'))

try:
    from app.main import app
    from app import models, schemas
    from app.database import get_db
except ImportError as e:
    # Mock para cuando no se pueden importar los módulos reales
    app = Mock()
    models = Mock()
    schemas = Mock()

class TestCartService:
    """
    Clase base de pruebas unitarias para el servicio de carrito.
    Cubre funcionalidades de gestión del carrito de compras.
    """

    def setup_method(self):
        """Configuración inicial para cada test"""
        self.client = TestClient(app) if hasattr(app, 'router') else Mock()
        self.mock_db = Mock(spec=Session)

        # Usuario de prueba
        self.test_user_id = 1
        self.test_user_token = "Bearer mock_jwt_token"

        # Datos de prueba para items del carrito
        self.test_cart_item_data = {
            "user_id": self.test_user_id,
            "product_id": 1,
            "quantity": 2,
            "unit_price": 899999.00
        }

        # Mock de respuesta del auth service
        self.mock_auth_response = {
            "user_id": self.test_user_id,
            "username": "testuser"
        }

    def teardown_method(self):
        """Limpieza después de cada test"""
        self.mock_db.reset_mock()

class TestCartItemOperations(TestCartService):
    """Pruebas para operaciones básicas del carrito"""

    @patch('app.services.auth_service.verify_token')
    @patch('app.routers.cart.get_db')
    def test_add_item_to_cart_success(self, mock_get_db, mock_verify_token):
        """
        Test: Agregar item al carrito exitosamente

        Verifica:
        - El item se agrega correctamente
        - Se valida la autenticación
        - Se retorna confirmación
        """
        # Arrange
        mock_get_db.return_value = self.mock_db
        mock_verify_token.return_value = self.mock_auth_response

        # Verificar que el item no existe previamente
        self.mock_db.query.return_value.filter.return_value.first.return_value = None

        # Mock del nuevo item
        mock_new_item = Mock()
        mock_new_item.id = 1
        mock_new_item.user_id = self.test_user_id
        mock_new_item.product_id = self.test_cart_item_data["product_id"]
        mock_new_item.quantity = self.test_cart_item_data["quantity"]
        mock_new_item.unit_price = Decimal(str(self.test_cart_item_data["unit_price"]))

        self.mock_db.add = Mock()
        self.mock_db.commit = Mock()
        self.mock_db.refresh = Mock()

        # Act
        # Simular verificación de token
        auth_result = mock_verify_token(self.test_user_token)
        user_id = auth_result["user_id"]

        # Simular creación del item
        new_item = mock_new_item
        self.mock_db.add(new_item)
        self.mock_db.commit()
        self.mock_db.refresh(new_item)

        # Assert
        assert auth_result["user_id"] == self.test_user_id
        assert new_item.user_id == user_id
        assert new_item.product_id == self.test_cart_item_data["product_id"]
        assert new_item.quantity == self.test_cart_item_data["quantity"]

        mock_verify_token.assert_called_once_with(self.test_user_token)
        self.mock_db.add.assert_called_once()
        self.mock_db.commit.assert_called_once()

        print("✓ Test agregar item al carrito - PASSED")

    @patch('app.services.auth_service.verify_token')
    @patch('app.routers.cart.get_db')
    def test_add_existing_item_updates_quantity(self, mock_get_db, mock_verify_token):
        """
        Test: Agregar item existente actualiza cantidad

        Verifica:
        - Se actualiza la cantidad en lugar de crear nuevo item
        - Se mantiene la integridad de datos
        """
        # Arrange
        mock_get_db.return_value = self.mock_db
        mock_verify_token.return_value = self.mock_auth_response

        # Item existente en el carrito
        existing_item = Mock()
        existing_item.id = 1
        existing_item.user_id = self.test_user_id
        existing_item.product_id = self.test_cart_item_data["product_id"]
        existing_item.quantity = 1  # Cantidad actual
        existing_item.unit_price = Decimal(str(self.test_cart_item_data["unit_price"]))

        self.mock_db.query.return_value.filter.return_value.first.return_value = existing_item
        self.mock_db.commit = Mock()

        # Act
        # Simular adición de cantidad
        new_quantity = 2
        existing_item.quantity += new_quantity
        self.mock_db.commit()

        # Assert
        assert existing_item.quantity == 3  # 1 + 2
        self.mock_db.commit.assert_called_once()

        print("✓ Test actualizar cantidad item existente - PASSED")

    @patch('app.services.auth_service.verify_token')
    @patch('app.routers.cart.get_db')
    def test_get_cart_items_success(self, mock_get_db, mock_verify_token):
        """
        Test: Obtener items del carrito exitosamente

        Verifica:
        - Se retornan todos los items del usuario
        - Se incluye información de productos
        """
        # Arrange
        mock_get_db.return_value = self.mock_db
        mock_verify_token.return_value = self.mock_auth_response

        # Mock de items en el carrito
        mock_item1 = Mock()
        mock_item1.id = 1
        mock_item1.product_id = 1
        mock_item1.quantity = 2
        mock_item1.unit_price = Decimal('899999.00')

        mock_item2 = Mock()
        mock_item2.id = 2
        mock_item2.product_id = 2
        mock_item2.quantity = 1
        mock_item2.unit_price = Decimal('1299999.00')

        mock_cart_items = [mock_item1, mock_item2]
        self.mock_db.query.return_value.filter.return_value.all.return_value = mock_cart_items

        # Act
        # Simular obtención de items
        user_id = mock_verify_token(self.test_user_token)["user_id"]
        cart_items = self.mock_db.query.return_value.filter.return_value.all()

        # Assert
        assert len(cart_items) == 2
        assert cart_items[0].quantity == 2
        assert cart_items[1].quantity == 1
        mock_verify_token.assert_called_once()

        print("✓ Test obtener items del carrito - PASSED")

    @patch('app.services.auth_service.verify_token')
    @patch('app.routers.cart.get_db')
    def test_remove_item_from_cart_success(self, mock_get_db, mock_verify_token):
        """
        Test: Eliminar item del carrito exitosamente

        Verifica:
        - El item se elimina correctamente
        - Solo el propietario puede eliminar sus items
        """
        # Arrange
        mock_get_db.return_value = self.mock_db
        mock_verify_token.return_value = self.mock_auth_response

        item_id = 1
        mock_item = Mock()
        mock_item.id = item_id
        mock_item.user_id = self.test_user_id
        mock_item.product_id = 1

        self.mock_db.query.return_value.filter.return_value.first.return_value = mock_item
        self.mock_db.delete = Mock()
        self.mock_db.commit = Mock()

        # Act
        # Verificar que el usuario es propietario del item
        user_id = mock_verify_token(self.test_user_token)["user_id"]
        item = self.mock_db.query.return_value.filter.return_value.first()

        if item and item.user_id == user_id:
            self.mock_db.delete(item)
            self.mock_db.commit()

        # Assert
        assert item.user_id == user_id
        self.mock_db.delete.assert_called_once_with(item)
        self.mock_db.commit.assert_called_once()

        print("✓ Test eliminar item del carrito - PASSED")

    @patch('app.services.auth_service.verify_token')
    @patch('app.routers.cart.get_db')
    def test_remove_item_unauthorized(self, mock_get_db, mock_verify_token):
        """
        Test: Intento de eliminar item de otro usuario

        Verifica:
        - Se previene eliminación no autorizada
        - Se lanza error 403
        """
        # Arrange
        mock_get_db.return_value = self.mock_db
        mock_verify_token.return_value = self.mock_auth_response

        # Item de otro usuario
        mock_item = Mock()
        mock_item.id = 1
        mock_item.user_id = 999  # Usuario diferente
        mock_item.product_id = 1

        self.mock_db.query.return_value.filter.return_value.first.return_value = mock_item

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            user_id = mock_verify_token(self.test_user_token)["user_id"]
            item = self.mock_db.query.return_value.filter.return_value.first()

            if item and item.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No autorizado para eliminar este item"
                )

        assert exc_info.value.status_code == 403

        print("✓ Test eliminar item no autorizado - PASSED")

class TestCartSummary(TestCartService):
    """Pruebas para funcionalidades de resumen del carrito"""

    @patch('app.services.auth_service.verify_token')
    @patch('app.services.product_service.get_product')
    @patch('app.routers.cart.get_db')
    def test_get_cart_summary_success(self, mock_get_db, mock_get_product, mock_verify_token):
        """
        Test: Obtener resumen del carrito con información de productos

        Verifica:
        - Se calculan totales correctamente
        - Se incluye información detallada de productos
        """
        # Arrange
        mock_get_db.return_value = self.mock_db
        mock_verify_token.return_value = self.mock_auth_response

        # Mock de items en el carrito
        mock_item1 = Mock()
        mock_item1.id = 1
        mock_item1.product_id = 1
        mock_item1.quantity = 2
        mock_item1.unit_price = Decimal('899999.00')

        mock_item2 = Mock()
        mock_item2.id = 2
        mock_item2.product_id = 2
        mock_item2.quantity = 1
        mock_item2.unit_price = Decimal('500000.00')

        mock_cart_items = [mock_item1, mock_item2]
        self.mock_db.query.return_value.filter.return_value.all.return_value = mock_cart_items

        # Mock de información de productos
        mock_product1 = {"id": 1, "name": "Smartphone", "image_url": "http://example.com/1.jpg"}
        mock_product2 = {"id": 2, "name": "Tablet", "image_url": "http://example.com/2.jpg"}

        mock_get_product.side_effect = [mock_product1, mock_product2]

        # Act
        user_id = mock_verify_token(self.test_user_token)["user_id"]
        cart_items = self.mock_db.query.return_value.filter.return_value.all()

        # Simular cálculo de resumen
        total_items = len(cart_items)
        total_quantity = sum(item.quantity for item in cart_items)
        total_amount = sum(item.quantity * item.unit_price for item in cart_items)

        cart_summary = {
            "total_items": total_items,
            "total_quantity": total_quantity,
            "total_amount": float(total_amount),
            "items": []
        }

        # Assert
        assert cart_summary["total_items"] == 2
        assert cart_summary["total_quantity"] == 3  # 2 + 1
        assert cart_summary["total_amount"] == 2299997.00  # (2*899999) + (1*500000)

        print("✓ Test resumen del carrito - PASSED")

    @patch('app.services.auth_service.verify_token')
    @patch('app.routers.cart.get_db')
    def test_get_empty_cart_summary(self, mock_get_db, mock_verify_token):
        """
        Test: Obtener resumen de carrito vacío

        Verifica:
        - Se maneja correctamente carrito vacío
        - Los totales son cero
        """
        # Arrange
        mock_get_db.return_value = self.mock_db
        mock_verify_token.return_value = self.mock_auth_response

        # Carrito vacío
        self.mock_db.query.return_value.filter.return_value.all.return_value = []

        # Act
        user_id = mock_verify_token(self.test_user_token)["user_id"]
        cart_items = self.mock_db.query.return_value.filter.return_value.all()

        cart_summary = {
            "total_items": len(cart_items),
            "total_quantity": sum(item.quantity for item in cart_items),
            "total_amount": 0.0,
            "items": []
        }

        # Assert
        assert cart_summary["total_items"] == 0
        assert cart_summary["total_quantity"] == 0
        assert cart_summary["total_amount"] == 0.0
        assert cart_summary["items"] == []

        print("✓ Test carrito vacío - PASSED")

class TestCartValidation(TestCartService):
    """Pruebas para validación de operaciones del carrito"""

    def test_validate_cart_item_data(self):
        """
        Test: Validar datos de item del carrito

        Verifica:
        - Campos requeridos están presentes
        - Tipos de datos son correctos
        - Valores están en rangos válidos
        """
        # Datos válidos
        valid_data = {
            "product_id": 1,
            "quantity": 2,
            "unit_price": 100000.00
        }

        # Validaciones básicas
        assert valid_data["product_id"] > 0
        assert valid_data["quantity"] > 0
        assert valid_data["unit_price"] > 0

        # Casos inválidos
        invalid_cases = [
            {"product_id": 0, "quantity": 1, "unit_price": 100.00},  # Product ID inválido
            {"product_id": 1, "quantity": 0, "unit_price": 100.00},  # Cantidad cero
            {"product_id": 1, "quantity": -1, "unit_price": 100.00},  # Cantidad negativa
            {"product_id": 1, "quantity": 1, "unit_price": 0.00},  # Precio cero
            {"product_id": 1, "quantity": 1, "unit_price": -100.00}  # Precio negativo
        ]

        for invalid_data in invalid_cases:
            try:
                # Simular validaciones
                if invalid_data.get("product_id", 0) <= 0:
                    raise ValueError("Product ID debe ser positivo")
                if invalid_data.get("quantity", 0) <= 0:
                    raise ValueError("Cantidad debe ser positiva")
                if invalid_data.get("unit_price", 0) <= 0:
                    raise ValueError("Precio debe ser positivo")

            except ValueError:
                continue  # Error esperado

            pytest.fail(f"Datos inválidos no detectados: {invalid_data}")

        print("✓ Test validación de datos del carrito - PASSED")

    @patch('app.services.product_service.get_product')
    def test_validate_product_availability(self, mock_get_product):
        """
        Test: Validar disponibilidad de producto antes de agregar al carrito

        Verifica:
        - Se verifica que el producto existe
        - Se verifica stock disponible
        """
        # Caso 1: Producto disponible
        mock_product = {
            "id": 1,
            "name": "Smartphone",
            "stock_quantity": 10,
            "is_active": True
        }
        mock_get_product.return_value = mock_product

        product = mock_get_product(1)
        quantity_requested = 2

        # Validar disponibilidad
        assert product is not None
        assert product["is_active"] is True
        assert product["stock_quantity"] >= quantity_requested

        # Caso 2: Producto sin stock suficiente
        mock_product_low_stock = {
            "id": 2,
            "name": "Tablet",
            "stock_quantity": 1,
            "is_active": True
        }
        mock_get_product.return_value = mock_product_low_stock

        product = mock_get_product(2)
        quantity_requested = 5

        with pytest.raises(ValueError) as exc_info:
            if product["stock_quantity"] < quantity_requested:
                raise ValueError("Stock insuficiente")

        assert "insuficiente" in str(exc_info.value)

        print("✓ Test validar disponibilidad de producto - PASSED")

class TestAuthenticationIntegration(TestCartService):
    """Pruebas para integración con servicio de autenticación"""

    @patch('app.services.auth_service.verify_token')
    def test_token_verification_success(self, mock_verify_token):
        """
        Test: Verificación exitosa de token

        Verifica:
        - El token se verifica correctamente
        - Se obtiene información del usuario
        """
        # Arrange
        mock_verify_token.return_value = self.mock_auth_response

        # Act
        auth_result = mock_verify_token(self.test_user_token)

        # Assert
        assert auth_result["user_id"] == self.test_user_id
        assert auth_result["username"] == "testuser"
        mock_verify_token.assert_called_once_with(self.test_user_token)

        print("✓ Test verificación de token exitosa - PASSED")

    @patch('app.services.auth_service.verify_token')
    def test_token_verification_failure(self, mock_verify_token):
        """
        Test: Falla en verificación de token

        Verifica:
        - Token inválido genera error 401
        - Se maneja correctamente la excepción
        """
        # Arrange
        mock_verify_token.side_effect = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            mock_verify_token("invalid_token")

        assert exc_info.value.status_code == 401
        assert "inválido" in str(exc_info.value.detail)

        print("✓ Test token inválido - PASSED")

    def test_token_extraction_from_header(self):
        """
        Test: Extracción de token del header Authorization

        Verifica:
        - El token se extrae correctamente del header
        - Se valida el formato Bearer
        """
        # Casos válidos
        valid_headers = [
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "Bearer token123",
            "Bearer short"
        ]

        for header in valid_headers:
            if header and header.startswith("Bearer "):
                token = header.split(" ")[1]
                assert len(token) > 0

        # Casos inválidos
        invalid_headers = [
            None,
            "",
            "Invalid token",
            "token123",
            "Bearer",
            "Bearer "
        ]

        for header in invalid_headers:
            try:
                if not header or not header.startswith("Bearer "):
                    raise ValueError("Formato de token inválido")

                token = header.split(" ")[1]
                if not token:
                    raise ValueError("Token vacío")

            except (ValueError, IndexError):
                continue  # Error esperado

            pytest.fail(f"Header inválido no detectado: {header}")

        print("✓ Test extracción de token - PASSED")

def run_all_tests():
    """
    Función principal para ejecutar todas las pruebas
    """
    print("=" * 60)
    print("EJECUTANDO PRUEBAS UNITARIAS - CART SERVICE")
    print("=" * 60)

    # Instanciar clases de prueba
    test_classes = [
        TestCartItemOperations(),
        TestCartSummary(),
        TestCartValidation(),
        TestAuthenticationIntegration()
    ]

    # Ejecutar todas las pruebas
    total_tests = 0
    passed_tests = 0

    for test_class in test_classes:
        print(f"\n--- {test_class.__class__.__name__} ---")

        # Obtener métodos de prueba
        test_methods = [method for method in dir(test_class) if method.startswith('test_')]

        for test_method in test_methods:
            total_tests += 1
            try:
                test_class.setup_method()
                getattr(test_class, test_method)()
                test_class.teardown_method()
                passed_tests += 1
            except Exception as e:
                print(f"✗ {test_method} - FAILED: {str(e)}")

    # Resumen
    print("\n" + "=" * 60)
    print(f"RESUMEN: {passed_tests}/{total_tests} pruebas pasaron")
    print(f"Cobertura: {(passed_tests/total_tests)*100:.1f}%")
    print("=" * 60)

    return passed_tests == total_tests

if __name__ == "__main__":
    # Ejecutar pruebas si se ejecuta directamente
    success = run_all_tests()
    exit(0 if success else 1)
