#!/bin/bash

# Extract image cover for podcast
# TODO: perf via resizing, format, etc...
ffmpeg -i podcast.mp3 -an -vcodec copy podcast.jpg

# Create video with single image for specific duration
# TODO: perf via video optimizations...
# TODO: send duration `-t flag` via node exec() or set default (of 1hr?) if not passed in
# 4411 (full podcast), 80 for segments processing (currently 5 segments @ 15sec)
ffmpeg -loop 1 -i podcast.jpg -c:v libx264 -t 4411 -pix_fmt yuv420p -r 15 podcast.mp4

# Create copy of video with subtitles (podcast transcript) burned in.
ffmpeg -i podcast.mp4 -vf "subtitles=podcast.srt" -c:v libx264 -crf 23 -c:a copy podcast_transcribed.mp4
