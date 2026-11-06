#!/bin/bash

podman run \
    -d \
    -p 8084:3000 \
    -p 8085:8085 \
    --net band4band \
    --ip 10.6.0.5 \
    --volume ./tmp:/usr/src/app/tmp:Z \
    --rm \
    --name=capsule-speech-to-text localhost/capsule-speech-to-text