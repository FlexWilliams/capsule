#!/bin/bash

PODCAST_IMAGE_URL=$1

if [ ! -f podcast.jpg ]; then
    echo "Error occurred extracting podcast image from audio file."


    if [[ -n "$PODCAST_IMAGE_URL" ]]; then
        echo "An image url was passed in, attempting to download."

        curl -s -L -o podcast.jpg $PODCAST_IMAGE_URL
    fi
fi