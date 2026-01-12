FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 3000

# Start in Development Mode (Hot Reload)
CMD ["npm", "run", "start:dev"]