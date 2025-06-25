# client/Dockerfile

FROM node:22.12.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm", "start"]
