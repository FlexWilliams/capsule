### Models

[ggerganov/whisper.cpp](https://huggingface.co/ggerganov/whisper.cpp/tree/main)

Replace in
`node_modules/audio2textjs/src/models`

https://huggingface.co/ggerganov/whisper.cpp/blob/main/ggml-tiny.bin

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

Probe audio for duration:
[Source](https://trac.ffmpeg.org/wiki/FFprobeTips)

```sh
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1 podcast.mp3
```

Extract image from audio file:
[Source](https://stackoverflow.com/a/13677225)

```sh
ffmpeg -i podcast.mp3 -an -vcodec copy podcast.jpg
```

Create video from single image:
[Source](https://www.ffmpeg-micro.com/blog/ffmpeg-create-video-from-images)

```sh
ffmpeg -loop 1 -i podcast.jpg -c:v libx264 -t 4411 -pix_fmt yuv420p -r 15 podcast.mp4
```

Add subtitles to video:
[Source](https://www.ffmpeg-micro.com/blog/ffmpeg-subtitles-filter-guide)

```sh
ffmpeg -i podcast.mp4 -vf "subtitles=podcast.srt" -c:v libx264 -crf 23 -c:a copy podcast_transcribed.mp4
```

### Cleanup Scripts

Remove Segments:

```sh
rm -f segment*.mp3
```
