import * as core from '@actions/core'
import * as github from '@actions/github'
import * as io from '@actions/io'
import {getBranchFromRef, getInput, toEnv} from './helpers'
import {writeFileSync} from 'fs'

/**
 * Definitely types the input variable names defined in our action.yml
 *
 * @author jordanskomer
 */
export type ActionInput = 'output_name' | 'output_dir'

async function run(): Promise<void> {
  try {
    const secrets = getInput('secrets') as Record<string, string>
    const outputFilename = getInput('output_name') || '.env'
    const outputDirectory = (getInput('output_dir') as string) || '.'
    const branch = getBranchFromRef(github.context.ref)
    core.debug(
      `Will create ${outputFilename} in ${outputDirectory} for ${branch}`
    ) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
    if (outputDirectory !== '.') io.mkdirP(outputDirectory)

    writeFileSync(
      `${outputDirectory}/${outputFilename}`,
      toEnv(secrets, branch)
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
