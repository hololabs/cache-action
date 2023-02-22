import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as path from 'path'
import * as util from '../common/util'
import inputs from '../common/inputs'

async function post(): Promise<void> {
  try {
    if (!inputs.ShouldSave) {
      core.info('Save is disabled.')
    }

    core.info(`Saving "${inputs.Path}" to "${inputs.remoteObject(inputs.Key)}"`)
    const res = await exec.getExecOutput('bash', ['-e', core.toPosixPath(path.normalize(`${__dirname}/../scripts/save.sh`))], {
      ignoreReturnCode: true,
      env: util.makeEnv(inputs, inputs.Key)
    })
    if (res.exitCode !== 0) {
      core.error('Save failed')
    } else {
      core.info('Save complete')
    }
  } catch (err) {
    core.setFailed(`${err}`)
  }
}

post()
