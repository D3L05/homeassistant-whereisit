# Multi-stage build for frontend
FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Final image
ARG BUILD_FROM
FROM $BUILD_FROM

# Install dependencies
RUN apk add --no-cache \
    nginx \
    sqlite

# Python dependencies
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Copy backend
WORKDIR /app
COPY app /app/app

# Copy built frontend
COPY --from=frontend-build /frontend/dist /app/frontend/dist

# Copy nginx config
COPY rootfs /

# Permissions
RUN chmod a+x /etc/services.d/whereisit/run
