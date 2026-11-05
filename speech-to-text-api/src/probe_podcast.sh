#!/bin/bash

# Probe for podcast duration
echo $(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1 podcast.mp3) 