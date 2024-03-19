FROM quay.io/quintype/public-base:node-20.11.1-alpine3.19 AS build

RUN apk update && \
    apk add git

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json /app/
RUN apk --no-cache --virtual build-dependencies add \
    python3 \
    make \
    g++
RUN npm install --legacy-peer-deps

# Environment variables for compile phase here
ENV MINIFY_CSS_CLASSNAMES true

# Everything above should be cached by docker. The below should run on every build

COPY . /app/
RUN git log -n1 --pretty="Commit Date: %aD%nBuild Date: `date --rfc-2822`%n%h %an%n%s%n" > public/round-table.txt

FROM quay.io/quintype/public-base:node-20.11.1-alpine3.19
MAINTAINER Quintype Developers <dev-core@quintype.com>

RUN apk update && \
    apk add curl tini && \
    addgroup -S app && \
    adduser -S -g app app

ENV NODE_ENV production
WORKDIR /app
USER app

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "start.js"]

COPY --from=build --chown=app:app /app /app
