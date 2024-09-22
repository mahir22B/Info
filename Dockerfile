# Stage 1: Build the React app
FROM node:16-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the production-ready React app
RUN npm run build

# Stage 2: Serve the built app using Nginx
FROM nginx:alpine

# Set working directory to Nginx's default HTML directory
WORKDIR /usr/share/nginx/html

# Remove default Nginx content
RUN rm -rf ./*

# Copy the built React app from the previous stage
COPY --from=build /app/build/ .

# Expose port 3000 for the Nginx server
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
