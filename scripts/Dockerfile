FROM node:lts-alpine3.13

WORKDIR /usr/src/scripts
COPY . .
RUN npm install
CMD ["node", "load-historical.js"]
