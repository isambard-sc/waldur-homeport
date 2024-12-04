# build environment
FROM node:lts-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json yarn.lock /app/
# Git is needed to refer with yarn to unrealised versions of libraries from github
# --no-cache: download package index on-the-fly, no need to cleanup afterwards
RUN apk add --no-cache git && yarn install

COPY . /app

ARG COMMIT_INFO="local-build"
# Create build-info directory and file if run locally
RUN mkdir -p /app/build-info && echo "$COMMIT_INFO" > /app/build-info/COMMIT_INFO

ARG VERSION=latest
ARG ASSET_PATH="/"
ENV VITE_API_URL="__API_URL__"
RUN sed -i "s/buildId: 'develop'/buildId: '$VERSION'/" src/configs/default.ts
ENV NODE_OPTIONS="--max-old-space-size=8096"
RUN rm -rf /app/node_modules && yarn install
RUN yarn vite build --base=$ASSET_PATH

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/dist/index.html /usr/share/nginx/html/index.orig.html
COPY --from=build /app/build-info/ /build-info/

ENV API_URL="http://localhost:8080"
ENV TITLE="Waldur | Cloud Service Management"

# replace default configuration
COPY docker/nginx-tpl.conf /etc/nginx/nginx-tpl.conf
COPY docker/entrypoint.sh /

EXPOSE 80
CMD [ "/entrypoint.sh" ]
