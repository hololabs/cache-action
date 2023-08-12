#!/bin/bash -e
: "${OBJECT_KEY:?OBJECT_KEY env var missing}"
: "${BUCKET:?BUCKET env var missing}"
: "${LOCAL_PATH:?LOCAL_PATH env var missing}"

export ZSTD_NBTHREADS="${ZSTD_NBTHREADS:-4}"
AWS_MAX_CONCURRENT_REQUESTS="${AWS_MAX_CONCURRENT_REQUESTS:-30}"

aws configure set default.s3.max_concurrent_requests "$AWS_MAX_CONCURRENT_REQUESTS"

if aws s3api head-object --bucket="$BUCKET" --key="$OBJECT_KEY"; then
    mkdir -p "$LOCAL_PATH"
    aws s3 cp "s3://${BUCKET}/${OBJECT_KEY}" - | tar -C "$LOCAL_PATH" --zstd -xf -
    exit 0
fi

# Special exit code to mean "not found"
exit 4
