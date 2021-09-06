# Typesource

Practice touch typing on source code

## Up and running

### Svelte

This project is created with the [webpack Svelte template](https://github.com/sveltejs/template-webpack), to spin it up install the dependencies:

```bash
npm install
```

Then start webpack dev server:

```bash
npm run dev
```

And start the Firebase local emulator:

```bash
firebase emulators:start
```

Finally navigate to [localhost:8080](http://localhost:8080).

### Tailwind

This projects uses [Tailwind](https://tailwindcss.com/), it is cofigured in `tailwind.config.js` and is imported with [Postcss](https://postcss.org/) which is impoted with [webpack post-css loader](https://github.com/webpack-contrib/postcss-loader) is configured in `postcss.config.js`.

Install the [Tailwind Intellisess](https://tailwindcss.com/docs/intellisense) vscode extention and set the vscode config `"editor.quickSuggestions": true` to enable autosuggestion (see [github issue](https://github.com/tailwindlabs/tailwindcss-intellisense/issues/151#issuecomment-684684682))

### Firebase

Firebase is used as db with [Firestore](https://firebase.google.com/docs/firestore) and as aith system with [Auth](https://firebase.google.com/docs/auth). You can start local emulators with:

```bash
firebase emulators:start
```

You can find the mulator UI at [localhost:4000](http://localhost:4000).

## Build

To create a production build just run:

```bash
npm run build
```

## Branches

- The "main" branch keeps the up to date code
- The "prod" branch keeps the production reary code (automatically deployed with netlify)
- Other features should go in "feature/new-thing"

---

## Requirements

- We want a web app
- The user can try the app without login
- The user has to login to use some funcionality (like creating and sharing rooms or to bypass github rest api rate limits)
- The user can login with github oauth
- The user can search for github public repository without leaving the app
- The user can navigate on repos folder structure (visit folder and go back)
- The user can pick a file
- The picked file will be displayed on the editor as a "preview"
- The user can select from which line the typing expiriece will start
- Three way to select where the text the user has to type ends:
  - The user can select a line where the range ends
  - There is a "digit count" with a (reasonable default) that sets the range end
  - There is a 60 seconds timer that let the user type from the range start until the timer stops
- The user can create and share a room via a custom url path
- The user who accepts the invitation will join the shared editor and cursors position
- All users in a room can propose file from a repo
- When a user is ready to start can press the "ready" button
- If someone changes the selected file all user will be set as "not ready"
- When all users in a room are ready for the selected file a countdown of 5 seconds will start and the 60 seconds match will start
- All user can see their own cursor and the cursor of other players in real time
- At the end of the 60 senconds match the user who typed more words wins
- After the match the room is alive and the player can pick a different file and start a new match

### Nice to have

- Match making with strangers
- The user can create a room on a selected file, other player can search "active" room by languges
  and join the room without manually sharing the invitation token

## Some design principles

- The editor should be in the center of the page (horizontally)
- All widgest can be hiddden while typing/racing
- Metrics should be shown while racing/typing near the typing area
- The line the user is typing should stay in the same position, the text
  should move up so the user can keep its eyes fixed in one line
