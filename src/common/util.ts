import * as os from 'os'
import * as path from 'path'
import {Inputs} from './inputs'

function processEnvObject(): {[key: string]: string} {
  const env: {[key: string]: string} = {}
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined) {
      env[k] = v
    }
  }
  return env
}

export function makeEnv(inputs: Inputs, key: string): {[key: string]: string} {
  const env: {[key: string]: string} = {
    ...processEnvObject(),
    OBJECT_KEY: path.posix.join(inputs.S3KeyPrefix, key),
    BUCKET: inputs.S3BucketName,
    LOCAL_PATH: inputs.Path
  }
  if (inputs.CompressionLevel !== '') {
    env.ZSTD_CLEVEL = inputs.CompressionLevel
  }
  if (inputs.CompressionThreads !== '') {
    env.ZSTD_NBTHREADS = inputs.CompressionThreads
  }
  env.RUNNER_TEMP = process.env.RUNNER_TEMP || os.tmpdir()
  return env
}
