#!/bin/bash
#
# This script is to be replaced by CLI and Tembo Cloud UI features:
#
# In the UI, we can create a feature for issuing long-lived tokens for any user.
# In the CLI, we can create a feature to allow for interactive log-in, and another feature to issue log-lived tokens after logging in.
#
# These features are based on the Clerk JWT templates feature. This feature allows a logged-in user to issue a long-lived token associated with their identity.
# https://clerk.com/docs/backend-requests/making/jwt-templates

set -e

# Check for curl
if ! command -v curl &> /dev/null; then
    echo "Error: curl is not installed."
    exit 1
fi

# Check for jq
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed."
    exit 1
fi

echo "Please enter your service user email:"
read EMAIL
echo ""

echo "Please enter your password (no visual feedback):"
read -s PASSWORD
echo ""

while true; do
    echo "Enter the number of days until expiry (1, 30, or 365):"
    read DAYS

    case $DAYS in
        1|30|365)
            break
            ;;
        *)
            echo "Invalid input. Please enter either 1, 30, or 365."
            ;;
    esac
done
echo ""

trap 'rm cookies > /dev/null 2>&1' EXIT
rm cookies > /dev/null 2>&1 || true

echo "Logging in with Clerk..."

RESPONSE_BODY=$(curl 'https://clerk.tembo.io/v1/client/sign_ins?_clerk_js_version=4.53.0' \
  -H 'authority: clerk.tembo.io' \
  -H 'origin: https://accounts.tembo.io' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -c ./cookies \
  --no-progress-meter \
  --data-urlencode "identifier=${EMAIL}" \
  --compressed)

if [ "$DEBUG" = "1" ]; then
  echo "debug: response body ${RESPONSE_BODY}"
fi

LOG_IN_TOKEN=$(echo $RESPONSE_BODY | jq -r '.response.id')

if [ "$LOG_IN_TOKEN" = "null" ]; then
    echo "Error while signing in:"
    echo "$RESPONSE_BODY"
    exit 1
fi

if [ "$DEBUG" = "1" ]; then
  echo "debug: log in token ${LOG_IN_TOKEN}"
fi

RESPONSE_BODY=$(curl "https://clerk.tembo.io/v1/client/sign_ins/${LOG_IN_TOKEN}/attempt_first_factor?_clerk_js_version=4.53.0" \
  -H 'authority: clerk.tembo.io' \
  -H 'origin: https://accounts.tembo.io' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -c ./cookies \
  -b ./cookies \
  --no-progress-meter \
  --data-urlencode "strategy=password" \
  --data-urlencode "password=${PASSWORD}" \
  --compressed)

if [ "$DEBUG" = "1" ]; then
  echo "debug: response body ${RESPONSE_BODY}"
fi

SESSION_TOKEN=$(echo $RESPONSE_BODY | jq -r '.client.sessions[0].id')

if [ "$SESSION_TOKEN" = "null" ]; then
    echo "Error while signing in:"
    echo "$RESPONSE_BODY"
    exit 1
fi

if [ "$DEBUG" = "1" ]; then
  echo "debug: session token ${SESSION_TOKEN}"
fi

echo "Issuing token..."

RESPONSE_BODY=$(curl -X POST "https://clerk.tembo.io/v1/client/sessions/${SESSION_TOKEN}/tokens/api-token-${DAYS}-days?_clerk_js_version=4.53.0" \
  -H 'authority: clerk.tembo.io' \
  --no-progress-meter \
  -b ./cookies \
  -H 'origin: https://accounts.tembo.io')

if [ "$DEBUG" = "1" ]; then
  echo "debug: response body $RESPONSE_BODY"
fi

TOKEN=$(echo $RESPONSE_BODY | jq -r '.jwt')

if [ "$TOKEN" = "null" ]; then
    echo "Error while signing in:"
    echo "$RESPONSE_BODY"
    exit 1
fi

echo "Done!"

echo ""
echo "For more information, please review the documentation: docs/tembo-cloud/api"
echo ""
echo "Token valid for ${DAYS} days:"
echo ""
echo $TOKEN
