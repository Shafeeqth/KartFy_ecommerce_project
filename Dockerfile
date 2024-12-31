# install base image
FROM node:latest

# set working directory
WORKDIR /app


COPY package*.json ./
RUN npm install

COPY . . 

CMD ["npm", "start"]