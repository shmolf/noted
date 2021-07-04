FROM php:7.4-fpm

LABEL maintainer='shmolf@gmail.com'

# Add international support
RUN apt-get update && apt-get install -y zlib1g-dev libicu-dev g++
RUN docker-php-ext-configure intl
RUN docker-php-ext-install intl

# Add MySQL connection support, for Doctrine
RUN docker-php-ext-install mysqli pdo pdo_mysql
RUN docker-php-ext-enable mysqli pdo pdo_mysql

# ToDo, figure out how to enable mbstring
# RUN docker-php-ext-install mbstring
# RUN docker-php-ext-enable mbstring

# RUN docker-php-ext-enable mysqli pdo pdo_mysql intl mbstring
# If using for a production-like environment, uncomment the next line
# RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

EXPOSE 9000
CMD php-fpm
