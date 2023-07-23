# Installation via Docker Compose
[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](https://github.com/bugeaud/MedShakeEHR-base/blob/master/tools/docker/README.en.md)

1. Install GIT & Docker according to the instructions for your platform. For example, on Ubuntu:

> sudo apt install git docker.io docker-compose

Note: The versions available in Ubuntu repositories are often outdated. If you encounter difficulties, refer to the Docker documentation. In this case, replace the `docker-compose` commands with `docker compose`.

2. Get the latest version of MedShakeEHR:

> git clone https://github.com/MedShake/MedShakeEHR-base.git

Until the integration request #32 is approved, you must instead use:

> git clone https://github.com/bugeaud/MedShakeEHR-base.git


3. Enter in the directory:

> cd MedShakeEHR-base

4. Copy and edit the environment variables at the root of the project:
```bash
cp tools/docker/sample.env .env
nano .env
# CTRL + X to exit
```
The variables to modify to your convenience are:
`MYSQL_ROOT_PASSWORD`: the root password of the database
`MYSQL_USER`: the database user
`MYSQL_PASSWORD`: the password of the database user
`MYSQL_DATABASE`: the name of the MedShakeEHR database
`VIRTUAL_HOST`: the domain name to access MedShakeEHR

5. Launch the docker-compose stack for the first time:
> docker-compose up --build

6. Wait for the composer dependencies installation finishing, then go to:
```
https://VIRTUAL_HOST/install.php
```
Accept the exception and follow the instructions.

If you encounter a problem:

> docker-compose logs -f

You can then manage your stack using the classic docker-compose commands.

## Update / Module Installation
### php mariadb
In the docker-compose.yml file:
- change the MedShakeEHR tag with the latest tag
- change the Mariadb tag with the latest version compatible with MedShakeEHR

> docker-compose up --build -d

### Via MedShakeEHR
Drag and drop the module zip to install or update as indicated in the documentation.

### Via Docker (to be done)
> docker-compose exec msehr.upgrade

## PHPmyAdmin
Uncomment the lines in docker-compose.yml and restart the stack:
> docker-compose up -d

## Orthanc
1. Uncomment the lines in docker-compose.yml
2. Copy the orthanc configuration file to the root of the project and modify it:

```bash
cp tools/docker/sample.orthanc.json orthanc.json
nano orthanc.json
# CTRL + X to exit
```

> docker-compose up -d

## Wireguard
1. Uncomment the lines in docker-compose.yml
2. Read the container documentation and adapt the .env file accordingly
> docker-compose up -d
