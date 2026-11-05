#!/bin/bash

podman run \
    -d \
    -p 5175:3000 \
    --net band4band \
    --ip 10.6.0.4 \
    --rm \
    --volume ./src/lib/server/db:/usr/src/app/build/db:Z \
    --name=capsule localhost/capsule