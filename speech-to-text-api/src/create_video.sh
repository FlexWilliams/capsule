#!/bin/bash

PODCAST_DURATION=$1

if [[ -n "$PODCAST_DURATION" ]]; then
    echo "Creating video for $PODCAST_DURATION seconds long."
else
    echo "No video duration set." >&2 

    exit 1
fi

PODCAST_IMAGE=podcast.jpg;

if [[ ! -f $PODCAST_IMAGE || ! -s "$PODCAST_IMAGE" ]]; then
    echo "No podcast image was found before video creation, using default image."

    PODCAST_IMAGE=default_cover.jpg
fi

# Create video with single image for specific duration
# TODO: perf via video optimizations...
ffmpeg -hide_banner -loglevel error -loop 1 -i $PODCAST_IMAGE -c:v libx264 -t $PODCAST_DURATION -pix_fmt yuv420p -r 15 podcast.mp4
