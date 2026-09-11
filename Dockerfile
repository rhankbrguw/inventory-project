FROM php:8.2-fpm

ARG WWWUSER=1000
ARG WWWGROUP=1000

WORKDIR /var/www

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libicu-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN groupadd --force -g $WWWGROUP laravel \
    && useradd -ms /bin/bash --no-user-group -g $WWWGROUP -u $WWWUSER laravel

COPY --chown=laravel:laravel . /var/www

RUN chown -R laravel:laravel /var/www/storage /var/www/bootstrap/cache && \
    chmod -R 775 /var/www/storage /var/www/bootstrap/cache

USER laravel

EXPOSE 9000

CMD ["php-fpm"]
