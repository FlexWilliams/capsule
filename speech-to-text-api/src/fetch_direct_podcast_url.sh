#!/bin/bash

PODCAST_URL=$1

if [[ -n "$PODCAST_URL" ]]; then
    echo "Fetching direct podcast url for: $PODCAST_URL"
else
    echo "No podcast url sent." >&2 

    exit 1
fi

if command -v curl >/dev/null 2>&1; then 
    echo "curl is available" 

    echo "Fetching url..."

    # TODO: check if exists and re-use
    DIRECT_URL=$(curl -L -I "$PODCAST_URL" 2>|/dev/null | awk '/^(Location:|location:)/ { print $2 }' | sed -e 's/[[:cntrl:]]//')

    echo "Direct url found to be: $DIRECT_URL"
fi
