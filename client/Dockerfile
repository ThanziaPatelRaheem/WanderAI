
# Stage 1: Build the React/Vite frontend using Node.js
FROM node:22-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to take advantage of Docker caching
COPY package*.json ./

# Install dependencies, including Vite
RUN npm ci

# Copy the frontend application files
COPY . .

# Set the API base URL for the production build
# An empty value makes requests use the current website's origin
# Nginx will later forward /api requests to the Express backend
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Generate the optimized React production build
RUN npm run build

# Stage 2: Serve the built frontend using Nginx
FROM nginx:alpine

# Copy the production files from the build stage
# Nginx serves static files from this directory
COPY --from=build /app/dist /usr/share/nginx/html

# Use our custom Nginx configuration for React routing and API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Document the HTTP port used by Nginx
EXPOSE 80

# Keep Nginx running as the container's main process
CMD ["nginx", "-g", "daemon off;"]
