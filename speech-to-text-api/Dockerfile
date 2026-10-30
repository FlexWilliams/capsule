FROM node:24-alpine

RUN apk add --no-cache bash curl ffmpeg

RUN addgroup -S capsule && adduser -S capsule -G capsule

WORKDIR /usr/src/app

COPY dist /usr/src/app/dist
COPY package.json /usr/src/app
COPY pnpm-lock.yaml /usr/src/app
COPY pnpm-workspace.yaml /usr/src/app

RUN npm install -g pnpm@11.1.3
RUN pnpm install --prod

# TODO: fix in fork to pull locally
COPY node_modules/audio2textjs/src/models/ggml-tiny.bin /usr/src/app/node_modules/.pnpm/audio2textjs@1.0.5/node_modules/audio2textjs/src/models/

RUN chown -R capsule:capsule /usr/src/app
RUN chmod 755 /usr/src/app

RUN chmod +rwx /usr/src/app/dist/*.sh

ENV BUILD_FOLDER="dist"

EXPOSE 8085

USER capsule:capsule

CMD ["node", "dist/index.js"]