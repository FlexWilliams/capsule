#!/bin/bash

# Extract image cover for podcast
# TODO: perf via resizing, format, etc...
echo $(ffmpeg -i podcast.mp3 -an -vcodec copy podcast.jpg) 