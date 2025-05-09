FROM node:20-bookworm
WORKDIR /app
ADD . .

RUN npm install \
    && npm install -g serve \
    && npm run build \
    && rm -fr node_modules

EXPOSE 3000

CMD ["npm", "run", "dev"]