FROM node:20-alpine

RUN apk add --no-cache libc6-compat curl

WORKDIR /app

COPY package.json ./
RUN npm install && npm install @pinia/nuxt

COPY . .

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000
EXPOSE 24678

CMD ["npm", "run", "dev"]
