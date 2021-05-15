# Stage 1: Build image
FROM node:lts-alpine3.13 AS build
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . ./

ARG RPC_ENDPOINT
ENV REACT_APP_RPC_ENDPOINT=${RPC_ENDPOINT}

ARG API_ENDPOINT
ENV REACT_APP_API_ENDPOINT=${API_ENDPOINT}

RUN npm run build

# Stage 2: Release image
FROM nginx:1.20-alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
