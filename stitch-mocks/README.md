# stitch-mocks/

Drop Google Stitch HTML outputs here. Filename convention: `<screen-name>-<YYYY-MM-DD>.html`.

When Carter sends a mock for conversion, Claude:

1. Reads the HTML.
2. Loads `docs/conversion-cheatsheet.md`.
3. Maps elements to shells in `src/components/`.
4. Translates Tailwind classes to NativeWind (see cheatsheet for gotchas).
5. Wires data and navigation.
6. Verifies in iOS simulator.
7. Moves the source HTML to `_archive/`.
8. Appends a one-liner to `.claude/memory/progress-log.md`.

Full procedure: `docs/workflow-recipe.md`.

## Folder layout
```
stitch-mocks/
├── README.md                              # this file
├── <pending mock files>.html
└── _archive/
    └── <converted mocks moved here>.html
```
