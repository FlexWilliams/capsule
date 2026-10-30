#!/bin/bash

# Create copy of video with subtitles (podcast transcript) burned in.
echo $(ffmpeg -hide_banner -loglevel error -i podcast.mp4 -vf "subtitles=podcast.srt" -c:v libx264 -crf 23 -c:a copy podcast_transcribed.mp4) 

