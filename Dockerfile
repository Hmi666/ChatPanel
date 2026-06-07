FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=6001

COPY package*.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY dist ./dist

EXPOSE 6001

CMD ["npm", "run", "server"]
