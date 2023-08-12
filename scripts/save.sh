#!/bin/bash -e
: "${OBJECT_KEY:?OBJECT_KEY env var missing}"
: "${BUCKET:?BUCKET env var missing}"
: "${LOCAL_PATH:?LOCAL_PATH env var missing}"
: "${RUNNER_TEMP:?RUNNER_TEMP env var missing}"

export ZSTD_CLEVEL="${ZSTD_CLEVEL:-3}"
export ZSTD_NBTHREADS="${ZSTD_NBTHREADS:-4}"
AWS_MAX_CONCURRENT_REQUESTS="${AWS_MAX_CONCURRENT_REQUESTS:-30}"

remote_object="s3://${BUCKET}/${OBJECT_KEY}"
hash=$(echo -n "$OBJECT_KEY" | sha1sum | cut -f1 -d" ")
temp_file="$RUNNER_TEMP/$hash"

function cleanup {
    rm -f "$temp_file"
}

aws configure set default.s3.max_concurrent_requests "$AWS_MAX_CONCURRENT_REQUESTS"

mkdir -p "$LOCAL_PATH"

# We'll use the uncompressed size of the folder as an upper bound on the size of the compressed tar archive.
# We have to provide this upper bound to aws s3, so it knows how to break down the file into a reasonable
# number of chunks (there cannot be more than 10k chunks).
uncompressed_size="$(du -sb "$LOCAL_PATH" | awk '{print $1}')"
echo "Cache item uncompressed size: $uncompressed_size"

trap cleanup EXIT

echo "Creating zstd compressed tar archive..."
tar -C "$LOCAL_PATH" --zstd -cf "$temp_file" . 

echo "Uploading archive..."
aws s3 cp --expected-size "$uncompressed_size" "$temp_file" "$remote_object"
