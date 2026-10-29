#!/bin/bash

if command -v curl >/dev/null 2>&1; then 
    echo "curl is available" 

    echo "Downloading podcast...!"

    # TODO, check if exists and re-use

    curl -L -o podcast.mp3 ${podcastUrl}

    echo "Download successful!"

    echo "Segmenting..."

    ffmpeg -i podcast.mp3 -f segment -segment_time 15 -c copy segments/segment%03d.mp3 

    echo "Done segmenting!"

    else

        echo "curl is not installed" >&2 

        exit 1
fi