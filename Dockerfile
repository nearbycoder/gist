# use the official Node.js 23 image
FROM node:22.14.0-bullseye-slim AS base
WORKDIR /usr/src/app

# Install curl
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Accept build arg for VITE_BETTER_AUTH_URL
ARG VITE_BETTER_AUTH_URL

FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json package-lock.json /temp/prod/
RUN cd /temp/prod && npm install

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/prod/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
ENV VITE_BETTER_AUTH_URL=${VITE_BETTER_AUTH_URL}
RUN npx prisma generate
RUN npm run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/ .

# Create db directory and set permissions
RUN mkdir -p /usr/src/app/db && chown -R node:node /usr/src/app/db

# run the app
USER node
EXPOSE 3000