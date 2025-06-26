FROM node:20-alpine3.20 AS build
WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN yarn install

COPY ./ ./

RUN npm run build

FROM nginx:1.28.0-alpine-slim
COPY --from=build /usr/src/app/nginx /etc/nginx/conf.d

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 88

ENTRYPOINT ["nginx", "-g", "daemon off;"]