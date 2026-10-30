FROM node:26-slim

RUN apt update && apt install -y ffmpeg curl

# Install Corepack:
RUN npm install -g corepack

# Download and install pnpm:
RUN corepack enable pnpm

# RUN addgroup -S capsule && adduser -S capsule -G capsule

WORKDIR /usr/src/app

COPY dist /usr/src/app/dist
COPY bin /usr/local/bin
COPY package.json /usr/src/app
COPY pnpm-lock.yaml /usr/src/app
COPY pnpm-workspace.yaml /usr/src/app

# RUN npm install -g pnpm@11.1.3
RUN pnpm install --prod

# RUN chmod +rwx /usr/local/bin/**.*
RUN chmod +rwx /usr/src/app/dist/bin/**.*
RUN chmod +rwx /usr/src/app/dist/bin/ffmpeg
RUN chmod +rwx /usr/src/app/dist/*.sh

# RUN chown -R capsule:capsule /usr/src/app
# RUN chmod 755 /usr/src/app

ENV BUILD_FOLDER="dist"

EXPOSE 8085

# USER capsule:capsule

CMD ["node", "dist/index.js"]