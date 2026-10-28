FROM node:24-alpine

RUN addgroup -S capsule && adduser -S capsule -G capsule

WORKDIR /usr/src/app

COPY build /usr/src/app/build
COPY package.json /usr/src/app
COPY pnpm-lock.yaml /usr/src/app
COPY pnpm-workspace.yaml /usr/src/app

RUN npm install -g pnpm@11.1.3
RUN pnpm install --prod

# Safe usage of env for database as read-only and no auth
# Via https://podcastindex.org/datasets
ENV DATABASE_URL="file:/usr/src/app/build/db/podcastindex_feeds.db"

EXPOSE 3000

USER capsule:capsule

CMD ["node", "build"]