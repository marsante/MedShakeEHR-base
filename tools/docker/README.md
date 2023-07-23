# Installation via Docker Compose
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/bugeaud/MedShakeEHR-base/blob/master/tools/docker/README.en.md)

1. Installez GIT & Docker selon les instructions de votre plateforme. Par exemple sous Ubuntu :

>sudo apt install git docker.io docker-compose

NB: Les versions disponibles dans les dépôts d'Ubuntu sont souvent anciennes. Si vous rencontrez des difficultés, référez-vous à la documentation de docker. Dans ce cas, remplacez les commandes `docker-compose` par `docker compose`

2. Récupérez la dernière version de MedShakeEHR:

>git clone https://github.com/MedShake/MedShakeEHR-base.git

Tant que la demande d'intégration #32 n'est pas actée, vous devez effectuer à la place :

>git clone https://github.com/bugeaud/MedShakeEHR-base.git

3. Entrer dans le répertoire

>cd MedShakeEHR-base

4. Copiez et éditez les variables d'environnements à la racine du projet :

```bash
cp tools/docker/sample.env .env
nano .env
# CTRL + X pour quitter
```

Les variables à modifier à votre convenance sont : 
`MYSQL_ROOT_PASSWORD` : le mot de passe root de la base de données
`MYSQL_USER` : l'utilisateur de la base de données
`MYSQL_PASSWORD`: le mot de passe de l'utilisateur de la base de données
`MYSQL_DATABASE` : le nom de la base de données de MedShakeEHR
`VIRTUAL_HOST` : le nom de domaine pour accéder à MedShakeEHR

5. Lancez la pile docker-compose pour la première fois :


> docker-compose up --build

6. Attendez dans les logs la fin de l'installation des dépendances de composer puis rendez-vous sur :

>https://VIRTUAL_HOST/install.php 

Acceptez l'exception et suivez les instructions.

Si vous rencontrez un problème ;
>https://VIRTUAL_HOST/install.php 
docker-compose logs -f

Vous pouvez ensuite gérer votre pile via les commandes classiques de docker-compose

## Mise à jour / installation de module
### php mariadb
Dans le fichier docker-compose.yml :
- modifiez le tag de MedShakeEHR avec le dernier tag 
- modifiez le tag de Mariadb avec la dernière version compatible pour MedShakeEHR 
> docker-compose up --build -d

### Via MedShakeEHR
Glissez le zip du module à installer ou mettre à jour comme indiqué dans la documentation.

### Via Docker (à faire)
docker-compose exec msehr.upgrade

## PHPmyAdmin
Décommentez les lignes dans docker-compose.yml et relancez la pile
> docker-compose up -d

## Orthanc
1. Décommentez les lignes dans docker-compose.yml
2. Copiez le fichier de configuration orthanc à la racine du projet et modifiez le

```
cp tools/docker/sample.orthanc.json orthanc.json
nano orthanc.json
# CTRL + X pour quitter
```
> docker-compose up -d

## Wireguard
1. Décommentez les lignes dans docker-compose.yml
2. Lisez la documentation du container et adapté le fichier .env en fonction
> docker-compose up -d
