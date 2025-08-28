# Build stage
FROM node:alpine AS build
WORKDIR /usr/src/app

# Copy the root package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm config set strict-ssl false
RUN npm install --no-package-lock

# Copy the entire workspace
COPY . .

# First build the core library
RUN npm run build core

# Build the specific application (e-suggestion)
RUN npm run build e-suggestion -- --configuration production

# Deploy the dist to nginx
FROM nginx:alpine
COPY ./projects/e-suggestion/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application from the build stage
COPY --from=build /usr/src/app/dist/e-suggestion/browser /usr/share/nginx/html

EXPOSE 80
