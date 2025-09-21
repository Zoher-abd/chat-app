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
