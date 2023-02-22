import * as core from '@actions/core'
import * as path from 'path'

export class Inputs {
  ShouldRestore: boolean
  ShouldSave: boolean
  Key: string
  Path: string
  RestoreKeys: string[]
  S3BucketName: string
  S3KeyPrefix: string
  CompressionLevel: string
  CompressionThreads: string

  constructor() {
    this.ShouldRestore = core.getBooleanInput('should-restore')
    this.ShouldSave = core.getBooleanInput('should-save')
    this.Key = core.getInput('key')
    this.Path = core.getInput('path')
    this.RestoreKeys = core.getMultilineInput('restore-keys')
    this.S3BucketName = core.getInput('s3-bucket-name')
    this.S3KeyPrefix = core.getInput('s3-key-prefix')
    this.CompressionLevel = core.getInput('compression-level')
    this.CompressionThreads = core.getInput('compression-threads')

    // Clean inputs
    this.S3BucketName = trimSuffix(trimPrefix(this.S3BucketName, 's3://'), '/')
    this.S3KeyPrefix = trimSuffix(trimPrefix(this.S3KeyPrefix, '/'), '/')
    this.Key = trimSuffix(trimPrefix(this.Key, '/'), '/')
    for (const [i, s] of this.RestoreKeys.entries()) {
      this.RestoreKeys[i] = trimSuffix(trimPrefix(s, '/'), '/')
    }
  }

  remoteObject(key: string): string {
    return `s3://${path.posix.join(this.S3BucketName, this.S3KeyPrefix, key)}`
  }
}

function trimPrefix(s: string, prefix: string): string {
  return s.startsWith(prefix) ? s.substring(prefix.length) : s
}

function trimSuffix(s: string, suffix: string): string {
  return s.endsWith(suffix) ? s.substring(0, s.length - suffix.length) : s
}

export default new Inputs()
