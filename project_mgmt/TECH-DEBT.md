# Capsule - Tech Debt

[Back to Project Board](./BOARD.md)

## Scripts

Lines of Code:

```
git ls-files --directory src/ | grep -E '\.js|\.ts|\.svelte' | xargs wc -l >> project_mgmt/stats/loc-005_06_26.txt
```

<br>

## To Review

1. Svelte api vs STT seperation of concerns
   - stt seems to be doing the heavy lifting, svelte api for what exactly (searching only, or storage too)?
2. Possible need/want to cancel transcription.

## Perf Opportunities

1. STT perf (multi-threading) and container resource limit increases

## Refactoring Opportunities

1. Remove test/debug code around various PiP and MediaSession events (ex. skipAd). Not all are supported by each browser and env (mobile/desktop)!
   - OR - harden for Progressive Enhancement with additional try/catch and logging...
2. Need to share data models between ui and stt
3. Cleanup .gitignores AND package.json cleanup script (yuck!)
4. Use a better ts-node project setup. literally just guessed at it but the tsconfig setup is hieroglyphics tbh...
5. Rework ui-wss flow... may require different messaging format or status...currently a mess and dupe work through spaghetti code ---> K I S S
