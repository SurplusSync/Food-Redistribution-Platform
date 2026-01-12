FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose Vite port
EXPOSE 5173

# Start Vite with host binding so Docker can see it
CMD ["npm", "run", "dev", "--", "--host"]