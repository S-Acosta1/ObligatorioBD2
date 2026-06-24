# ObligatorioBD2

## Correr con docker

El proyecto está dockerizado, contando con scripts de creación para las
imágenes del backend y frontend. También tiene un archivo de Docker Compose
para levantar el proyecto para desarrollo y para producción, la diferencia
siendo a qué base de datos apunta el backend, la local o la de la cátedra.

Con cualquier de estas dos alternativas, el contenedor deberá recrearse si se
realiza un cambio en la aplicación. Es recomendado correr la aplicación
nativamente en la máquina, y luego tener la base aparte.

### Local

El comando para correr la aplicación de manera local es la siguiente.

```sh
docker compose up --build
```

Los datos de mysql serán almacenados en el volumen `mysql-data` de docker, que
persiste

### Con base remota

El comando para correr la aplicación con la base de la cátedra es este.

```sh
docker compose -f docker-compose.prod.yml up --build
```

Nótese que las credenciales para correrlo con la base remota se deben cargar en
el archivo ./.env, con la variable `ConnectionStrings__DefaultConnection` para
que sean leídas al empezar, por un tema de seguridad.

