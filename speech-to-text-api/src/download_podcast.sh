#!/bin/bash

PODCAST_URL=$1

if [[ -n "$PODCAST_URL" ]]; then
    echo "Downloading: $PODCAST_URL"
else
    echo "No podcast url sent." >&2 

    exit 1
fi

if command -v curl >/dev/null 2>&1; then 
    echo "curl is available" 

    echo "Downloading podcast...!"

    # TODO, check if exists and re-use

    curl -L -o podcast.mp3 $PODCAST_URL

    echo "Download successful!"

    echo "Segmenting..."

    mkdir -p segments

    ffmpeg -i podcast.mp3 -f segment -segment_time 15 -c copy segments/segment%03d.mp3 

    echo "Done segmenting!"

    else

        echo "curl is not installed" >&2 

        exit 1
fi

# TODO: ffprobe for audio duration and pass back to node to properly set video duration

# TODO: remove below, needed to speed up testing.
# SKIP=5
# INDEX=0

# for SEGMENT in $(ls segments)
# do
#     if [[ "$INDEX" -le "$SKIP" ]]; then
#         echo "Skipping removal of segment $INDEX"
#     else
#         echo "Removing segment $INDEX" >&2 

#         rm segments/$SEGMENT
#     fi

#     let INDEX=${INDEX}+1
# done