#!/bin/bash -e
: "${OBJECT_KEY:?OBJECT_KEY env var missing}"
: "${BUCKET:?BUCKET env var missing}"
: "${LOCAL_PATH:?LOCAL_PATH env var missing}"
: "${RUNNER_TEMP:?RUNNER_TEMP env var missing}"

export ZSTD_CLEVEL="${ZSTD_CLEVEL:-3}"
export ZSTD_NBTHREADS="${ZSTD_NBTHREADS:-4}"
AWS_MAX_CONCURRENT_REQUESTS="${AWS_MAX_CONCURRENT_REQUESTS:-30}"

hash=$(echo -n "$OBJECT_KEY" | sha1sum | cut -f1 -d" ")
temp_file="$RUNNER_TEMP/$hash"

# If windows, convert to unix-style path
if [[ "$(uname -s)" == MINGW* ]]; then
    temp_file="$(cygpath -u "$temp_file")"
fi

function cleanup {
    rm -f "$temp_file"
}

aws configure set default.s3.max_concurrent_requests "$AWS_MAX_CONCURRENT_REQUESTS"

if aws s3api head-object --bucket="$BUCKET" --key="$OBJECT_KEY"; then
    mkdir -p "$LOCAL_PATH"

    trap cleanup EXIT
    
    echo "Downloading and decompressing..."
    time aws s3 cp "s3://${BUCKET}/${OBJECT_KEY}" - | zstd --no-progress -d - -o "$temp_file"

    echo "Extracting tar archive..."
    time tar -C "$LOCAL_PATH" -xf "$temp_file"
    
    exit 0
fi

# Special exit code to mean "not found"
exit 4
