#!/bin/bash

PODCAST_DURATION=$1

if [[ -n "$PODCAST_DURATION" ]]; then
    echo "Creating video for $PODCAST_DURATION seconds long."
else
    echo "No video duration set." >&2 

    exit 1
fi

# Create video with single image for specific duration
# TODO: perf via video optimizations...
ffmpeg -loop 1 -i podcast.jpg -c:v libx264 -t $PODCAST_DURATION -pix_fmt yuv420p -r 15 podcast.mp4
