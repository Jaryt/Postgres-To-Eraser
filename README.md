# Postgres Schema to Eraser Diagram as Code

## Overview

This Node.js script utilizes `pg-structure` to connect to a PostgreSQL database and convert its schema into a an (Eraser.io)[eraser.io] "Diagram as Code". It was made within an hour (and is probably hacky), so it might need some tweaking for your use case.

## Requirements

- Node.js
- Typescript
- PostgreSQL database access

## Dependencies

- `pg-structure`: To extract database schema information.
- `yargs`: To parse command line arguments.
- `fs/promises`: To write the output to a file.

## Setup

1. Run `npm install`
2. Make sure your postgresql database is running.
3. Run the script

```
 npm run convert -- --database <database> --user postgres --password <password>
```

### Options

- `--database`: Database name (required)
- `--user`: Database user (required)
- `--password`: Database password (required)
- `--host`: Database host (default: "localhost")
- `--schema`: Schema to be exported (default: "public")
- `--filename`: Output file name (default: "output.txt")
