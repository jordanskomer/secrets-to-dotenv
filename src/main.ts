import * as core from '@actions/core'
import * as io from '@actions/io'
import {getInput, toEnv} from './helpers'
import {writeFileSync} from 'fs'

/**
 * Definitely types the input variable names defined in our action.yml
 *
 * @author jordanskomer
 */
export type ActionInput = 'output_name' | 'output_dir'

async function run(): Promise<void> {
  try {
    const outputFilename = getInput('output_name') || '.env'
    const outputDirectory = getInput('output_dir')
    if (outputDirectory !== '') io.mkdirP(outputDirectory)
    writeFileSync(`.${outputDirectory}/${outputFilename}`, toEnv())
  } catch (error) {
    if (error instanceof Error && !getInput<boolean>('ignore_errors'))
      core.setFailed(error.message)
  }
}

run()
