#!/bin/bash

pnpm run build && \
podman build --tag=capsule-speech-to-text -f ./Dockerfile