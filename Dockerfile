# Lightweight Node image
FROM node:18-alpine

# Create working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy rest of project
COPY . .

# Expose your app port (your app runs on 3000)
EXPOSE 3000

# Start application
CMD ["npm", "start"]
