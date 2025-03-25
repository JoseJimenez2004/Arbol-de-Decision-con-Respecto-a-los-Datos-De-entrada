# FastAPI Binary Tree Generator

Este proyecto es una aplicación web que genera un árbol binario con etiquetas personalizadas o generadas automáticamente. La aplicación utiliza FastAPI para crear una API REST que permite generar y visualizar árboles binarios con varios nodos. La estructura del árbol puede ser visualizada a través de una plantilla HTML renderizada con Jinja2.

## Requerimientos

Para ejecutar este proyecto, necesitas tener instaladas las siguientes librerías:

- `fastapi`: Framework para construir la API web.
  - Comando para instalar:  
    ```bash
    pip install fastapi
    ```

- `uvicorn`: Servidor ASGI para ejecutar la aplicación FastAPI.
  - Comando para instalar:  
    ```bash
    pip install uvicorn
    ```

- `networkx`: Librería para la creación y manipulación de grafos y redes.
  - Comando para instalar:  
    ```bash
    pip install networkx
    ```

- `jinja2`: Motor de plantillas para renderizar el HTML.
  - Comando para instalar:  
    ```bash
    pip install jinja2
    ```

Puedes instalar todas las dependencias a la vez utilizando el siguiente comando:

```bash
pip install fastapi uvicorn networkx jinja2


Instrucciones de Ejecución --%
Clona o descarga el repositorio del proyecto.

Instala las dependencias requeridas utilizando pip install -r requirements.txt o manualmente con el comando pip install fastapi uvicorn networkx jinja2.

Asegúrate de que el directorio templates contenga las plantillas necesarias (por ejemplo, index.html).

Ejecuta el servidor utilizando uvicorn de la siguiente manera:

bash
Copiar
Editar
uvicorn app:app --reload
Esto iniciará el servidor en el puerto predeterminado (8000). Ahora puedes acceder a la aplicación en http://127.0.0.1:8000/.