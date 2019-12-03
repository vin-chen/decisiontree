FROM node:10 AS builder

RUN mkdir -p /application

WORKDIR /application
COPY ./application .

RUN npm install 
RUN npm run build:ssr


CMD [ "npm", "run", "start:prod:ssr" ]