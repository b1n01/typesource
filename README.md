# Typesource

Typesource let's you practice your touch typing skills on real world code. **Check it out live on [typesource.dev](https://typesource.dev)**.

## Features

- Select files from public repositories on Github
- Track your daily progress with statistics and charts
- Race against other players online

## Development

First of all you need to install the [Firebase CLI](https://firebase.google.com/docs/cli), this will allow you to use the Firebase emulators and sync your development project with the production one. You need to create a Firebase project with a Firestore database and the Authentication system enabled.

Once you have your Firebase project credentias you need to set them as local environment variables. You can copy the `.env.dist` file into the `.env` file and update the example content:

```bash
cp .env.example .env
```

Install dependencies:

```bash
npm install
```

Start webpack development server:

```bash
npm run dev
```

And (in a different terminal window) the Firebase emulator:

```bash
firebase emulators:start
```

Typesource and the Firebase Emulator UI are now served locally (check the teminal to see ports number).

---

To update Firestore Rules update the `firestore.rules` file (if you do so while the emulator is running you get rules validation in real time) and run:

```bash
firebase deploy --only firestore:rules
```

And to update Firestore Indexes update the `firestore.indexes.json` file and run:

```bash
firebase deploy --only firestore:indexes
```

To create a production build run:

```bash
npm run build
```

Thank to the `_redirects` file in the public folder you can deploy the project directly to [Netlify](https://netlify.com).

### Overview

Typesource is build with [Svelte](https://svelte.dev/), [Tailwind](https://tailwindcss.com/) and [Firebase](https://firebase.google.com/).

It has been created with the [Svelte-Webpack template](https://github.com/sveltejs/template-webpack). Tailwind is loaded via [Postcss](https://postcss.org/) and it's configuation are in `tailwind.config.js`. Postcss is imported via [webpack post-css loader](https://github.com/webpack-contrib/postcss-loader) and it's configuration are in `postcss.config.js`. You can install the [Tailwind Intellisess](https://tailwindcss.com/docs/intellisense) vscode extention and set the vscode config variable `"editor.quickSuggestions": true` to enable autosuggestion (see [github issue](https://github.com/tailwindlabs/tailwindcss-intellisense/issues/151#issuecomment-684684682)). [Firebase Firestore](https://firebase.google.com/docs/firestore) is used as database and [Firebase Authentication](https://firebase.google.com/docs/auth) as the authentication system.

## Dev journey

Typesource development has been recorded from day zero and is published [here](https://www.youtube.com/playlist?list=PLI4ZJrRnqqm2Y82Vq5NSZUZNzieyoC9jn).
