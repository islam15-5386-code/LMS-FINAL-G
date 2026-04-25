FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

RUN apt-get update \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        composer \
        php-cli \
        php-curl \
        php-mbstring \
        php-pgsql \
        php-sqlite3 \
        php-xml \
        php-zip \
        postgresql-client \
        unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
