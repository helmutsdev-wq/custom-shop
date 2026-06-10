FROM php:8.2-fpm-bookworm

ARG UID=1000
ARG GID=1000

RUN groupadd --gid ${GID} magento && \
    useradd --uid ${UID} --gid ${GID} -m -d /home/magento -s /bin/bash magento

RUN apt-get update && apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    wget \
    gnupg \
    libbz2-dev \
    libfreetype6-dev \
    libgmp-dev \
    libicu-dev \
    libjpeg62-turbo-dev \
    libldap2-dev \
    libmagickwand-dev \
    libpng-dev \
    libwebp-dev \
    libxpm-dev \
    libzip-dev \
    libsodium-dev \
    libssl-dev \
    libc-ares-dev \
    libpq-dev \
    libonig-dev \
    libxml2-dev \
    libxslt1-dev \
    libyaml-dev \
    cron \
    git \
    jq \
    lsof \
    mariadb-client \
    nano \
    netcat-openbsd \
    procps \
    python3 \
    sendmail \
    supervisor \
    unzip \
    vim \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd \
    --with-freetype --with-jpeg --with-webp --with-xpm

RUN docker-php-ext-install \
    bcmath \
    bz2 \
    calendar \
    exif \
    gd \
    gettext \
    gmp \
    intl \
    ldap \
    mbstring \
    mysqli \
    opcache \
    pcntl \
    pdo_mysql \
    shmop \
    soap \
    sockets \
    sysvmsg \
    sysvsem \
    sysvshm \
    xml \
    xsl \
    zip

RUN pecl install \
    apcu \
    igbinary \
    imagick \
    msgpack \
    pcov \
    redis \
    && docker-php-ext-enable \
    apcu \
    igbinary \
    imagick \
    msgpack \
    pcov \
    redis \
    sodium

RUN pecl install xdebug-3.3.2 && docker-php-ext-enable xdebug

COPY docker/php/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN curl -sS https://get.symfony.com/cli/installer | bash && \
    mv /root/.symfony5/bin/symfony /usr/local/bin/symfony

RUN mkdir -p /usr/local/etc/php-fpm.d/ && \
    mkdir -p /var/www/html && \
    mkdir -p /var/log/php && \
    mkdir -p /var/run && \
    chown -R magento:magento /var/www/html /var/log/php /var/run

COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/magento-php.ini /usr/local/etc/php/conf.d/magento.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf

USER magento:magento

WORKDIR /var/www/html

EXPOSE 9000
