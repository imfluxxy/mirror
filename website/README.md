# Mirror Website

This is a minimal Node.js + Express application that lists and serves files from the `../files` directory.

## Install

```bash
cd website
npm install
```

## Run

```bash
npm start
# or for development with auto-reload
npm run dev
```

Open http://localhost:3000 in your browser.

## Notes
- The server reads from `../files` relative to the `website` folder. Ensure that directory exists and contains files.
- Paths are validated to prevent directory traversal.
