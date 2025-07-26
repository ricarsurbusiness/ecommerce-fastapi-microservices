#!/usr/bin/env python3
"""
Script principal para ejecutar todas las pruebas unitarias del sistema E-Commerce

Este script ejecuta todas las pruebas unitarias de los diferentes microservicios
y genera un reporte consolidado de los resultados.

Uso:
    python run_all_tests.py
    python run_all_tests.py --verbose
    python run_all_tests.py --service auth
    python run_all_tests.py --coverage
"""

import sys
import os
import argparse
import importlib
import time
from datetime import datetime
from typing import Dict, List, Tuple

# Agregar el directorio actual al path para importar los módulos de prueba
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

class TestRunner:
    """
    Clase principal para ejecutar y gestionar todas las pruebas unitarias
    """

    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.results = {}
        self.start_time = None
        self.end_time = None

        # Configuración de servicios de prueba disponibles
        self.test_modules = {
            'auth': {
                'module': 'test_auth_service',
                'name': 'Servicio de Autenticación',
                'description': 'Pruebas para registro, login y verificación de tokens'
            },
            'product': {
                'module': 'test_product_service',
                'name': 'Servicio de Productos',
                'description': 'Pruebas para gestión de productos y categorías'
            },
            'cart': {
                'module': 'test_cart_service',
                'name': 'Servicio de Carrito',
                'description': 'Pruebas para operaciones del carrito de compras'
            }
        }

    def print_header(self):
        """Imprime el header del reporte de pruebas"""
        print("=" * 80)
        print("🧪 SISTEMA DE PRUEBAS UNITARIAS - E-COMMERCE")
        print("=" * 80)
        print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🏗️  Arquitectura: Microservicios")
        print(f"🐍 Python Version: {sys.version.split()[0]}")
        print("=" * 80)

    def print_service_info(self, service_key: str, service_info: Dict):
        """Imprime información del servicio que se va a probar"""
        if self.verbose:
            print(f"\n📋 SERVICIO: {service_info['name']}")
            print(f"📝 Descripción: {service_info['description']}")
            print(f"📦 Módulo: {service_info['module']}")
            print("-" * 50)

    def run_service_tests(self, service_key: str) -> Tuple[bool, Dict]:
        """
        Ejecuta las pruebas de un servicio específico

        Args:
            service_key: Clave del servicio ('auth', 'product', 'cart')

        Returns:
            Tuple con (éxito, diccionario de resultados)
        """
        service_info = self.test_modules[service_key]
        module_name = service_info['module']

        self.print_service_info(service_key, service_info)

        try:
            # Importar el módulo de prueba dinámicamente
            test_module = importlib.import_module(module_name)

            # Verificar si el módulo tiene la función run_all_tests
            if not hasattr(test_module, 'run_all_tests'):
                print(f"❌ Error: {module_name} no tiene función 'run_all_tests'")
                return False, {
                    'service': service_info['name'],
                    'status': 'ERROR',
                    'message': 'Función run_all_tests no encontrada',
                    'tests_run': 0,
                    'tests_passed': 0,
                    'execution_time': 0
                }

            # Ejecutar las pruebas
            start_time = time.time()

            # Capturar stdout para obtener información de las pruebas
            if not self.verbose:
                # Redirigir stdout temporalmente para capturar salida
                import io
                from contextlib import redirect_stdout

                captured_output = io.StringIO()
                with redirect_stdout(captured_output):
                    success = test_module.run_all_tests()

                output = captured_output.getvalue()
            else:
                success = test_module.run_all_tests()
                output = ""

            end_time = time.time()
            execution_time = end_time - start_time

            # Parsear resultados del output si está disponible
            tests_run, tests_passed = self.parse_test_output(output)

            result = {
                'service': service_info['name'],
                'status': 'PASSED' if success else 'FAILED',
                'tests_run': tests_run,
                'tests_passed': tests_passed,
                'execution_time': execution_time,
                'coverage': ((tests_passed / tests_run) * 100) if tests_run > 0 else 0
            }

            return success, result

        except ImportError as e:
            print(f"❌ Error importando {module_name}: {str(e)}")
            return False, {
                'service': service_info['name'],
                'status': 'IMPORT_ERROR',
                'message': str(e),
                'tests_run': 0,
                'tests_passed': 0,
                'execution_time': 0
            }
        except Exception as e:
            print(f"❌ Error ejecutando pruebas de {service_key}: {str(e)}")
            return False, {
                'service': service_info['name'],
                'status': 'EXECUTION_ERROR',
                'message': str(e),
                'tests_run': 0,
                'tests_passed': 0,
                'execution_time': 0
            }

    def parse_test_output(self, output: str) -> Tuple[int, int]:
        """
        Parsea la salida de las pruebas para extraer estadísticas

        Args:
            output: Salida capturada de las pruebas

        Returns:
            Tuple con (total_tests, passed_tests)
        """
        lines = output.split('\n')
        tests_run = 0
        tests_passed = 0

        for line in lines:
            if 'RESUMEN:' in line and '/' in line:
                # Buscar patrones como "RESUMEN: 15/20 pruebas pasaron"
                try:
                    parts = line.split()
                    for part in parts:
                        if '/' in part:
                            passed, total = part.split('/')
                            tests_passed = int(passed)
                            tests_run = int(total)
                            break
                except:
                    continue
            elif '✓' in line and 'PASSED' in line:
                tests_passed += 1
                tests_run += 1
            elif '✗' in line and 'FAILED' in line:
                tests_run += 1

        return tests_run, tests_passed

    def run_all_services(self, specific_service: str = None) -> bool:
        """
        Ejecuta las pruebas de todos los servicios o uno específico

        Args:
            specific_service: Si se especifica, solo ejecuta pruebas de este servicio

        Returns:
            True si todas las pruebas pasaron, False en caso contrario
        """
        self.start_time = time.time()
        all_passed = True

        services_to_test = [specific_service] if specific_service else list(self.test_modules.keys())

        for service_key in services_to_test:
            if service_key not in self.test_modules:
                print(f"❌ Servicio '{service_key}' no encontrado")
                continue

            success, result = self.run_service_tests(service_key)
            self.results[service_key] = result

            if not success:
                all_passed = False

        self.end_time = time.time()
        return all_passed

    def print_summary(self):
        """Imprime el resumen final de todas las pruebas"""
        print("\n" + "=" * 80)
        print("📊 RESUMEN DE RESULTADOS")
        print("=" * 80)

        total_tests = 0
        total_passed = 0
        total_services = len(self.results)
        services_passed = 0

        for service_key, result in self.results.items():
            status_icon = "✅" if result['status'] == 'PASSED' else "❌"

            print(f"\n{status_icon} {result['service']}")
            print(f"   📈 Estado: {result['status']}")

            if result['tests_run'] > 0:
                print(f"   🧪 Pruebas: {result['tests_passed']}/{result['tests_run']}")
                print(f"   📊 Cobertura: {result['coverage']:.1f}%")
                print(f"   ⏱️  Tiempo: {result['execution_time']:.2f}s")

                total_tests += result['tests_run']
                total_passed += result['tests_passed']

                if result['status'] == 'PASSED':
                    services_passed += 1
            else:
                if 'message' in result:
                    print(f"   ❌ Error: {result['message']}")

        # Estadísticas generales
        print("\n" + "-" * 80)
        print("📈 ESTADÍSTICAS GENERALES:")
        print(f"   🏢 Servicios probados: {services_passed}/{total_services}")
        print(f"   🧪 Pruebas totales: {total_passed}/{total_tests}")

        if total_tests > 0:
            overall_coverage = (total_passed / total_tests) * 100
            print(f"   📊 Cobertura general: {overall_coverage:.1f}%")

        if self.start_time and self.end_time:
            total_time = self.end_time - self.start_time
            print(f"   ⏱️  Tiempo total: {total_time:.2f}s")

        # Estado final
        if services_passed == total_services and total_passed == total_tests:
            print("\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!")
            return_code = 0
        else:
            print(f"\n❌ {total_services - services_passed} servicio(s) fallaron")
            print(f"❌ {total_tests - total_passed} prueba(s) fallaron")
            return_code = 1

        print("=" * 80)
        return return_code

    def generate_report(self, filename: str = None):
        """
        Genera un reporte detallado en archivo de texto

        Args:
            filename: Nombre del archivo de reporte (opcional)
        """
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"test_report_{timestamp}.txt"

        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("REPORTE DE PRUEBAS UNITARIAS - SISTEMA E-COMMERCE\n")
                f.write("=" * 60 + "\n")
                f.write(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Duración total: {self.end_time - self.start_time:.2f}s\n\n")

                for service_key, result in self.results.items():
                    f.write(f"SERVICIO: {result['service']}\n")
                    f.write(f"Estado: {result['status']}\n")
                    f.write(f"Pruebas: {result['tests_passed']}/{result['tests_run']}\n")
                    f.write(f"Cobertura: {result.get('coverage', 0):.1f}%\n")
                    f.write(f"Tiempo: {result['execution_time']:.2f}s\n")
                    f.write("-" * 40 + "\n")

                f.write(f"\nReporte guardado: {filename}\n")

            print(f"📄 Reporte guardado en: {filename}")

        except Exception as e:
            print(f"❌ Error generando reporte: {str(e)}")

def main():
    """Función principal del script"""
    parser = argparse.ArgumentParser(
        description='Ejecutar pruebas unitarias del sistema E-Commerce',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  python run_all_tests.py                    # Ejecutar todas las pruebas
  python run_all_tests.py --verbose          # Ejecutar con salida detallada
  python run_all_tests.py --service auth     # Solo pruebas de autenticación
  python run_all_tests.py --report           # Generar reporte de resultados
  python run_all_tests.py --list-services    # Listar servicios disponibles
        """)

    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Mostrar salida detallada de las pruebas')
    parser.add_argument('--service', '-s', type=str,
                       help='Ejecutar pruebas solo para un servicio específico (auth, product, cart)')
    parser.add_argument('--report', '-r', action='store_true',
                       help='Generar reporte detallado en archivo')
    parser.add_argument('--list-services', '-l', action='store_true',
                       help='Listar servicios disponibles para pruebas')

    args = parser.parse_args()

    # Crear instancia del runner
    runner = TestRunner(verbose=args.verbose)

    # Listar servicios si se solicita
    if args.list_services:
        print("Servicios disponibles para pruebas:")
        for key, info in runner.test_modules.items():
            print(f"  {key}: {info['name']}")
            print(f"    {info['description']}")
        return 0

    # Imprimir header
    runner.print_header()

    # Ejecutar pruebas
    success = runner.run_all_services(args.service)

    # Mostrar resumen
    return_code = runner.print_summary()

    # Generar reporte si se solicita
    if args.report:
        runner.generate_report()

    return return_code

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n❌ Ejecución interrumpida por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")
        sys.exit(1)
