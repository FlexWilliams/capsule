import Audio2TextJS from "audio2textjs";
import { exec } from "child_process";
import express from "express";
import fs from "node:fs";

type WhisperTranscription = {
  timestamps: {
    from: string;
    to: string;
  };
  offsets: {
    from: number;
    to: number;
  };
  text: string;
};

type WhispterItemData = {
  transcription: WhisperTranscription[];
};

type WhipserItem = {
  type: string;
  data: WhispterItemData;
};

type Audio2TextJSResult = {
  success: boolean;
  output: WhipserItem[];
  message: string;
};

async function transcribe(
  fileName: string,
): Promise<WhisperTranscription[] | null> {
  return new Promise((resolve, reject) => {
    // Example usage
    const converter = new Audio2TextJS({
      threads: 4,
      processors: 1,
      outputJson: true,
    });

    const inputFile = `segments/${fileName}`;
    const model = "tiny"; // Specify one of the available models
    const language = "auto"; // or specify a language code for translation

    converter
      .runWhisper(inputFile, model, language)
      .then((result: Audio2TextJSResult) => {
        if (result.success) {
          console.log("Conversion successful:", result.output);

          const items = result.output as WhipserItem[];

          const transcription = items[0]?.data?.transcription || null;

          resolve(transcription);
        } else {
          console.error("Conversion failed:", result.message);
          resolve(null);
        }
      })
      .catch((error: Error) => {
        console.error("Error:", error);
        reject(error);
      });
  });
}

const app = express();

app.use(express.json());

const port = 3000;

app.get("/", async (req, res) => {
  res.send("");
});

type TranscriptionRequest = {
  podcastUrl: string;
};

app.post("/transcribe", async (req, res) => {
  const { podcastUrl } = req.body as TranscriptionRequest;

  // TODO: improve validation here and update to use regex
  if (
    !podcastUrl ||
    (!podcastUrl.startsWith(`http://`) && !podcastUrl.startsWith(`https://`))
  ) {
    return res.status(400).send("Bad Request");
  }

  // TODO: Cache this
  const script = fs
    .readFileSync("dist/script.sh", "utf8")
    .replace("${podcastUrl}", podcastUrl);

  const start = performance.now();

  exec(script, async (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr:\n${stderr.trim()}`);
      res.status(500).send();
    }

    let segments = fs.readdirSync("segments");

    console.log(`\nSegments in directory: ${segments.length}`);

    const transcript: WhisperTranscription[] = [];

    for (const s of segments) {
      console.log(`Processing sgement: ${s}`);

      const transciptions = await transcribe(s);
      if (transciptions) {
        transcript.push(...transciptions);
      } else {
        console.error(`Transcription failure for segment: ${s}`);
      }
    }

    const end = performance.now();

    const diff = (end - start) / 1000 / 60; // in minutes

    console.log(
      `Request for podcast ${podcastUrl} took ${diff}min to process.`,
    );

    console.log(transcript);

    console.log(`stdout: ${stdout.trim()}`);
  });

  res.send(`Processing video w/captions for podcast: ${podcastUrl}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
