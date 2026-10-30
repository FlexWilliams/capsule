FROM node:26-slim

RUN apt update && apt install -y ffmpeg curl

# Install Corepack:
RUN npm install -g corepack

# Download and install pnpm:
RUN corepack enable pnpm

# 1. Create a system group and user (avoiding interactive prompts and password requirements)
RUN groupadd -r capsule && useradd -r -g capsule -m -s /sbin/nologin capsule

WORKDIR /usr/src/app

COPY dist /usr/src/app/dist
COPY package.json /usr/src/app
COPY pnpm-lock.yaml /usr/src/app
COPY pnpm-workspace.yaml /usr/src/app

RUN pnpm install --prod

RUN chown -R capsule:capsule /usr/src/app
RUN chmod 755 /usr/src/app

ENV BUILD_FOLDER="dist"

EXPOSE 8085

USER capsule

CMD ["node", "dist/index.js"]