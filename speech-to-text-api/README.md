### Models

[ggerganov/whisper.cpp](https://huggingface.co/ggerganov/whisper.cpp/tree/main)

Replace in
`node_modules/audio2textjs/src/models`

### FFmpeg Scripts

Mp3 to Mp3(s):

```sh
DIRECTORY=segments;

if [ ! -d "$DIRECTORY" ]; then
 mkdir segments
fi

ffmpeg -i tim.mp3 -f segment -segment_time 15 -c copy segments/segment%03d.mp3
```

Mp3 to Wav(s):

```sh
DIRECTORY=segments;

if [ ! -d "$DIRECTORY" ]; then
 mkdir segments
fi

ffmpeg -i tim.mp3 -f segment -segment_time 15 -c copy segments/segment%03d.wav
```

Remove Segments:

```sh
rm -f segment*.mp3
```
