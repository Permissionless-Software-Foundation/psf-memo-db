# psf-memo-db

LevelDB REST API for the Memo protocol indexer. Architecture mirrors [psf-slp-db](https://github.com/Permissionless-Software-Foundation/psf-slp-db).

## Requirements

- node ^20
- npm ^10

## Installation

```bash
cd psf-memo-db
npm install
cp .env-example .env   # optional
npm start
```

Default port: **5021**

## API

All indexer data is exposed under `/level/*` with CRUD routes per entity (`post`, `like`, `name`, `profile`, `status`, etc.) plus:

- `POST /level/backup` — zip database snapshot
- `POST /level/restore` — restore from snapshot (exits process)
- `GET /health` — health check

## Tests

```bash
npm test
```

## License

MIT
