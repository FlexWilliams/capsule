#!/bin/bash

PODCAST_IMAGE_URL=$1

# Extract image cover for podcast
# TODO: perf via resizing, format, etc...
echo $(ffmpeg -hide_banner -loglevel error -i podcast.mp3 -an -vcodec copy podcast.jpg) 