FROM python:3.10

# Establecer directorio de trabajo
WORKDIR /app

# Copiar e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

COPY .env .env

# Configurar variable de entorno para importar módulos correctamente
ENV PYTHONPATH=/app

# Comando para arrancar el microservicio
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
