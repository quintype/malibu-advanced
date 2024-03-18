FROM node-20.11.1-alpine3.19
# the node version here should match with node version in the main DockerFile

RUN apk update && \
    apk add bash tini && \
    apk add git && \
    addgroup -S app && \
    adduser -S -g app app

RUN mkdir -p /app/node_modules && chown app:app -R /app
VOLUME ["/app", "/app/node_modules"]

WORKDIR /app
USER app

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["bash"]
