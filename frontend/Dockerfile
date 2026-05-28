# Use Node.js 20 Alpine as base image
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy environment file for Docker
COPY .env.docker .env

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . ./

# Build the app
RUN npm run build

# Use Nginx to serve the built app
FROM nginx:alpine

# Copy built app to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]