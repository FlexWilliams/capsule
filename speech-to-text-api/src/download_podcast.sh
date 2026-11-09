#!/bin/bash

PODCAST_ID=$1
PODCAST_URL=$2
SUB_FOLDER=$3

DOWNLOAD_FOLDER=./tmp/$SUB_FOLDER

if ! [[ -n "$PODCAST_ID" ]]; then
    echo "No podcast id sent." >&2 

    exit 1
fi

if [[ -n "$PODCAST_URL" ]]; then
    echo "Downloading: $PODCAST_URL"
else
    echo "No podcast url sent." >&2 

    exit 1
fi

if [[ ! -n "$SUB_FOLDER" ]]; then
    echo "No subfolder provided." >&2 

    # TODO: REVIEW if you want to default to `misc` folder instead.

    exit 1
fi


if command -v curl >/dev/null 2>&1; then 
    echo "curl is available" 

    echo "Downloading podcast...!"

    mkdir -p $DOWNLOAD_FOLDER

    # TODO: check if exists and re-use
    curl -s -L -o $DOWNLOAD_FOLDER/podcast.mp3 $PODCAST_URL

    echo "Download successful!"

    echo "Segmenting..."

    mkdir -p $DOWNLOAD_FOLDER/segments

    ffmpeg -hide_banner -loglevel error -i $DOWNLOAD_FOLDER/podcast.mp3 \
        -f segment -segment_time 15 -c copy $DOWNLOAD_FOLDER/segments/segment%03d.mp3 

    echo "Done segmenting!"

    else

        echo "curl is not installed" >&2 

        exit 1
fi

# TODO: remove below, needed to speed up testing.
# SKIP=5
# INDEX=0

# for SEGMENT in $(ls segments)
# do
#     if [[ "$INDEX" -le "$SKIP" ]]; then
#         echo "Skipping removal of segment $INDEX"
#     else
#         echo "Removing segment $INDEX"

#         rm segments/$SEGMENT
#     fi

#     let INDEX=${INDEX}+1
# done