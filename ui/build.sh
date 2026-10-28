#!/bin/bash

pnpm run build:prod && \
podman build --tag=capsule -f ./Dockerfile