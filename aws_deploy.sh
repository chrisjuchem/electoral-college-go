# This is run by github actions when pushing to main.
# Set AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY to run manually.

set -e

aws s3 cp ./build/index.html s3://www.chrisjuchem.dev/electoral-college-go

aws s3 rm s3://www.chrisjuchem.dev/diplomacy-chess/ --recursive
aws s3 cp build/electoral-college-go s3://www.chrisjuchem.dev/electoral-college-go/ --recursive

aws cloudfront create-invalidation --distribution-id E1SB35Z0FSXGIF \
    --paths "/electoral-college-go*"
