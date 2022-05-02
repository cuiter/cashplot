# CashPlot Next

An app that assists in making financial decisions.

<img align="center" src="public/assets/img/favicon-192x192.png" alt="" />
<img align="center" src="media/img/favicon-192x192.png" alt="" />

Note: This app is currently in an early alpha phase.

See the [main branch](https://github.com/cuiter/cashplot) for the existing complete web application.

# Usage

Go to the website at <https://cuiter.me/cashplot-next> or download the latest release:

-   Web: https://cuiter.me/cashplot-next/CashPlot-latest.tar.gz
-   Android: https://cuiter.me/cashplot-next/CashPlot-latest.apk

# Development

CashPlot is built using TypeScript and Node.JS.  
The following sections will describe how to build and develop CashPlot locally.

## Prerequisites

To build CashPlot, install the following dependency:

-   Node.JS (version 14 or newer): https://nodejs.org/en/download/

When using the VSCode or VSCodium IDE, the following extensions are recommended:

-   [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
-   [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
-   [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur)

The following sections will use commands executed from the command-line (e.g. from Git Bash, Powershell or another shell).

## Building

Run `npm install` to install the dependencies.

Run `npm run build` to build CashPlot.  
Opening the file `public/index.html` in the browser will start the web application.

To automatically re-build CashPlot on every code change, run `npm run build -- --watch`  
Live-reload will now be enabled when opening the `public/index.html` file.

**Android**

To build CashPlot for Android, install the following dependencies:

-   Android SDK (including build tools version 30): https://developer.android.com/sdk/
-   Java JDK: https://openjdk.java.net/install/

Enter the `app/` directory (`cd app`) and run `npm install && npm run configure`.

Finally, after building the web application, run `npm run build` inside the `app/` directory to build the Android app.  
The resulting bundle will be located at `build/outputs/apk/debug/app-debug.apk`

## Testing

Run `npm run test` to run all unit tests.

It is possible to re-run tests automatically on a code change using `npm run test -- --watch`

## Generating documentation

Run `npm run gen-docs` to generate the documentation site. The resulting documentation can be accessed by opening `docs/public/index.html`.

## Formatting and linting

To ensure overall consistency and code quality, CashPlot makes use of linting and formatting tools.

To format the codebase: `npm run format`

To lint the codebase: `npm run lint`  
This will display any errors found in the codebase.
