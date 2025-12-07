# Useful recipes for development

image-name := "we1-local-test"

# shows available recipes
recipes:
    just --list

# runs the server locally
run-server:
    bun --hot src/server.ts

# builds the docker image (requires a local installation of Docker)
build-docker:
    docker build -t {{ image-name }} .    

# runs the server using docker
run-docker: build-docker
    docker run --publish 8080:8080 {{ image-name }} 

# runs bash on the container
run-docker-bash: build-docker
    docker run -it {{ image-name }} bash



# Justfile für Aufgabe 5 – SQLite Datenbank

# Pfad zur SQLite-Datei
db-file := "data/chat.db"

# ---- 1) DB löschen ----
delete-db:
    @echo "Lösche Datenbank-Datei {{db-file}} ..."
    rm -f {{db-file}}

# ---- 2) DB mit Schema erstellen ----
create-db:
    @echo "Erstelle neue Datenbank mit Schema ..."
    mkdir -p data
    sqlite3 {{db-file}} < data/create.sql

# ---- 3) DB mit Testdaten befüllen ----
populate-db:
    @echo "Fülle Datenbank mit Testdaten ..."
    sqlite3 {{db-file}} < data/populate.sql

# ---- 4) Alles auf einmal: löschen + erstellen + füllen ----
reset-db: delete-db create-db populate-db
    @echo " Datenbank wurde komplett neu initialisiert."
