# relax-ng-to-typescript

Convert a RELAX-NG schema into typescript types

## Usage

```bash
npm run gen -- -g grammar_file.rng -o out_directory/
```

If `npm run gen` doesn't work, you can try `vite-node`

```bash
npx vite-node scripts/generate-typescript.ts -- -g pretext.rng -o tmp/
```