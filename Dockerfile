# https://hub.docker.com/_/nginx/tags?page=1&name=alpine
FROM nginx:stable-alpine3.17
COPY dist/ /usr/share/nginx/html/
COPY public/ /usr/share/nginx/html/
COPY src/assets/ /usr/share/nginx/html/
