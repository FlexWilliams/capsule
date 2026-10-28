# Capsule - Tech Debt

[Back to Project Board](./BOARD.md)

## Scripts

Lines of Code:

```
git ls-files --directory src/ | grep -E '\.js|\.ts|\.svelte' | xargs wc -l >> project_mgmt/stats/loc-005_06_26.txt
```

<br>

# Refactoring Opportunities

1. Remove test/debug code around various PiP and MediaSession events (ex. skipAd). Not all are supported by each browser and env (mobile/desktop)!
   - OR - harden for Progressive Enhancement with additional try/catch and logging...

2.
