FROM node:20-slim

WORKDIR /app

# Copy package definition
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build
RUN npm run build

# Expose ports
EXPOSE 4100
EXPOSE 4905

# Start
CMD ["node", "dist/index.js"]
