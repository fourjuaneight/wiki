# Use Alpine Linux as our base image so that we minimize the overall size our final container, and minimize the surface area of packages that could be out of date.
FROM node:16.19.1-alpine as builder

# Config
ENV GLIBC_VER=2.27-r0
ENV HUGO_VER=0.112.7

# Build dependencies
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" > /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/v3.11/main" >> /etc/apk/repositories \
  && apk upgrade -U -a \
  && apk add --no-cache \
  autoconf \
  automake \
  bash \
  build-base \
  ca-certificates \
  curl \
  freetype \
  g++ \
  gcc \
  git \
  harfbuzz \
  libstdc++ \
  libtool \
  make \
  nasm \
  nss \
  openssh-client \
  pkgconfig \
  python \
  ttf-freefont \
  && rm -rf /var/cache/* \
  && mkdir /var/cache/apk

# Install glibc: This is required for HUGO-extended (including SASS) to work.
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub \
  && wget "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/$GLIBC_VER/glibc-$GLIBC_VER.apk" \
  && apk --no-cache add "glibc-$GLIBC_VER.apk" \
  && rm "glibc-$GLIBC_VER.apk" \
  && wget "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/$GLIBC_VER/glibc-bin-$GLIBC_VER.apk" \
  && apk --no-cache add "glibc-bin-$GLIBC_VER.apk" \
  && rm "glibc-bin-$GLIBC_VER.apk" \
  && wget "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/$GLIBC_VER/glibc-i18n-$GLIBC_VER.apk" \
  && apk --no-cache add "glibc-i18n-$GLIBC_VER.apk" \
  && rm "glibc-i18n-$GLIBC_VER.apk"

# Install HUGO
RUN wget -qO- "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VER}/hugo_extended_${HUGO_VER}_Linux-64bit.tar.gz" | tar xz \
  && mv hugo /usr/local/bin/hugo \
  && chmod +x /usr/local/bin/hugo \
  && hugo version

# Add go binaries to PATH
COPY --from=golang:alpine /usr/local/go /usr/local/go
ENV PATH="/usr/local/go/bin:${PATH}"

# Install npm dependencies
WORKDIR /app
COPY package*.json /app/
RUN npm install

# Get a clean image with binaries and the pre-built node modules
FROM node:16.19.1-alpine
COPY --from=builder /usr/local/bin/hugo /usr/local/bin/hugo
COPY --from=builder /app/node_modules /app/node_modules

# Install go dependencies
WORKDIR /app
COPY go.mod /app/
COPY go.sum /app/
RUN go mod download
RUN go mod tidy
