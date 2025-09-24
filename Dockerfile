FROM oven/bun:latest

# Enable automatic health checks
RUN apt-get update && apt-get install -y curl

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

WORKDIR /app

# Copy the neccessary files
COPY package.json tsconfig.json .
COPY src/ src/
COPY static/ static/

# Expose port 8080
EXPOSE 8080

# Run the server
CMD ["bun", "src/server.ts"]
