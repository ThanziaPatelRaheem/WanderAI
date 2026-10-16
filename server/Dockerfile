
# Use Node.js 22 with a lightweight Alpine Linux base image
FROM node:22-alpine

# Set the working directory inside the Docker container
WORKDIR /app

# Copy package.json and package-lock.json into the container
# Copying these first allows Docker to cache dependency installation
COPY package*.json ./

# Install only production dependencies
# Development tools such as Vitest are not needed at runtime
RUN npm ci --omit=dev

# Copy the Express backend source code into the container
COPY src ./src

# Set the Node.js environment to production
ENV NODE_ENV=production

# Document the port used by the Express application
# EXPOSE does not publish the port to your computer
EXPOSE 8080

# Start the Express backend when the container runs
CMD ["node", "src/server.js"]
