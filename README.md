# Electoral College Go

Web-based multiplayer go variant with scoring based on the US's electoral college. 
Deployed at [chrisjuchem.dev/electoral-college-go](http://chrisjuchem.dev/electoral-college-go).

## Deployment

Github Actions is set up to build and deploy the website to S3 whenever a commit is pushed to main.
The css and js are inlined into the html page using gulp, but images are still uploaded separately.

## When modifying patches updating patches
`yarn patch-package tenuki && rm -r node_modules/ && yarn install && yarn start`
