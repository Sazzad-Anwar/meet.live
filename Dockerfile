FROM  node:alpine

WORKDIR /usr/vid-chat-app
COPY ./package.json ./
RUN npm install
COPY ./ ./

CMD [ "npm","start" ]