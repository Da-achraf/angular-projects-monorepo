# # Build stage
# FROM node:alpine AS build
# WORKDIR /usr/src/app
# COPY package.json package-lock.json ./
# RUN npm config set strict-ssl false
# RUN npm install --force
# COPY . .
# RUN npm build e-suggestion -- --configuration production


# # Deploy the dist to nginx
# FROM nginx:alpine
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=build /usr/src/app/dist/e-suggestion /usr/share/nginx/html
# EXPOSE 80


# Build stage
FROM node:alpine AS build
WORKDIR /usr/src/app

# Copy the root package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm config set strict-ssl false
RUN npm install --force

# Copy the entire workspace
COPY . .

# Build the specific application (e-suggestion)
RUN npm run build e-suggestion -- --configuration production

# Deploy the dist to nginx
FROM nginx:alpine
COPY ./projects/e-suggestion/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application from the build stage
COPY --from=build /usr/src/app/dist/e-suggestion/browser /usr/share/nginx/html

EXPOSE 80