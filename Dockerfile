FROM node:18-slim As build
RUN mkdir /app
WORKDIR /app

COPY package.json yarn.lock tsconfig.json tsconfig.node.json vite.config.ts index.html ./

RUN yarn install --frozen-lockfile --non-interactive

COPY src ./src
RUN yarn build

FROM nginx:latest
RUN mkdir /app
WORKDIR /app
COPY --from=build /app/dist /app
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
