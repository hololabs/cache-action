import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as path from 'path'
import * as util from '../common/util'
import inputs from '../common/inputs'

async function restore(key: string): Promise<boolean> {
  core.info(`Restoring cache key "${key}" from "${inputs.remoteObject(key)}"`)
  const res = await exec.getExecOutput('bash', ['-e', core.toPosixPath(path.normalize(`${__dirname}/../scripts/restore.sh`))], {
    ignoreReturnCode: true,
    env: util.makeEnv(inputs, key)
  })
  if (res.exitCode !== 0) {
    if (res.exitCode === 4) {
      core.info('Not found')
    } else {
      core.error('Restore failed')
    }
    return false
  }
  core.info('Restore complete')
  return true
}

async function main(): Promise<void> {
  try {
    if (!inputs.ShouldRestore) {
      core.info('Restore is disabled.')
    }

    const keys = [...inputs.RestoreKeys]
    if (keys.length === 0 || keys[0] !== inputs.Key) {
      keys.unshift(inputs.Key)
    }

    for (const key of keys) {
      if (await restore(key)) {
        core.setOutput('cache-hit', true)
        return
      }
    }

    core.warning('No cache item found.')
    core.setOutput('cache-hit', false)
  } catch (err) {
    core.setFailed(`${err}`)
  }
}

main()
