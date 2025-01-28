# remix-mantine-prisma-jest-template
Single page app template using modern stack

The app is currently called `gahmuret`, after the father of Parzival in Wolfram von Eschenbach's Parzival.  Please change the name.


## Stack

+ Typescript
+ Prisma
+ Remix
+ Vite
+ Mantine
+ Jest
  + Basic set of 5 tests
    + tests pass, but Remix v2 has React Router v7 warnings (not errors)
+ ESLint
+ Google OAuth login
  + Requires using Google Cloud Platform to create an OAuth app
    + then insert credentials in environment variables
  + Ensure the OAuth app's redirect URI matches the environment variable
    + e.g. APP_URL=http://localhost:4000
+ Message files, initially populated for
  + English (en.json)
  + Spanish (es.json)
+ Database session storage
  + can be switched to cookie-based or memory-based
+ Docker for non-DO deployments
  + tested with DigitalOcean App Platform using default buildpacks
+ Newrelic (feature toggled off by default)

Also worth taking a look at [Epic stack](https://www.epicweb.dev/epic-stack)!


## Install

```
pnpm install
```

See the scripts defined in `package.json` for more information.


## Getting started

+ Populate `.env.local` using template described in `.env.example`
+ Run `pnpm run dev` or use IDEA NPM window
    + Starts dev server


## Debugging

```
localStorage.debug = 'gahmuret:*'
```
Look for debugging output in the server-side output.
