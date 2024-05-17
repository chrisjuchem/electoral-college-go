# Diplomacy Chess

Web-based multiplayer chess variant inspired by the strategy game Diplomacy. 
Deployed at [chrisjuchem.dev/diplomacy-chess](http://chrisjuchem.dev/diplomacy-chess).

# Deployment

Github Actions is set up to build and deploy the website to S3 whenever a commit is pushed to main.
The css and js are inlined into the html page using gulp, but images are still uploaded separately.
