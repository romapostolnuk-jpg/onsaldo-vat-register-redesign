# Onsaldo VAT Register Demo

A responsive, Polish-language accounting SaaS prototype built with React, TypeScript, and Vite. The app connects an accounting areas landing page with demonstration VAT sales and purchase registers.

## Features

- Shared application navigation between the accounting areas and VAT register, using hash-based routes such as `#areas` and `#vat`.
- Separate fictional sales and purchase records with calculated VAT summaries.
- Search, year/month/operation/JPK/document-series filters, removable filter chips, and clear-all.
- Pagination, document detail view, local review marking, filtered CSV download, and print styling.
- Demonstration populated, empty, no-results, and error states.
- Informational previews for accounting areas that are not implemented.

## Technology

- React and React DOM
- TypeScript
- Vite
- lucide-react icons

## Local setup

Use a Node.js version supported by the installed Vite release and npm.

```sh
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Typecheck and production build

```sh
npm run typecheck
npm run build
npm run preview
```

`npm run build` runs the TypeScript project build before creating the production bundle in `dist/`. `npm run preview` serves that bundle locally.

## Demo limitations

This is a demonstration prototype with fictional data. It has no backend, persistent accounting operations, or real KSeF integration. Register actions and statuses are illustrative and do not submit data to an accounting or government service.
