# Electoral College Go

Web-based multiplayer go variant inspired with scoring based on the US's electoral college. 
Deployed at [chrisjuchem.dev/electoral-college-go](http://chrisjuchem.dev/electoral-college-go).

# Deployment

Github Actions is set up to build and deploy the website to S3 whenever a commit is pushed to main.
The css and js are inlined into the html page using gulp, but images are still uploaded separately.
