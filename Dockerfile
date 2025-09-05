# Use a two-stage build for smaller final image
FROM oven/bun:latest

WORKDIR /app

# Copy the neccessary files
COPY package.json tsconfig.json .
COPY static/ static/
COPY src/ src/

# Expose port 8080
EXPOSE 8080

# Run the server
CMD ["bun", "src/server.ts"]
