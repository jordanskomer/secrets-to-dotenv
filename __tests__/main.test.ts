import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {expect, test} from '@jest/globals'
import * as helpers from '../src/helpers'

// Inputs for mock @actions/core
let inputs = {} as any

describe('secrets-to-dotenv tests', () => {
  beforeAll(() => {
    // Mock getInput
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      return inputs[name]
    })
    // Mock error/warning/info/debug
    jest.spyOn(core, 'error').mockImplementation(jest.fn())
    jest.spyOn(core, 'warning').mockImplementation(jest.fn())
    jest.spyOn(core, 'info').mockImplementation(jest.fn())
    jest.spyOn(core, 'debug').mockImplementation(jest.fn())
  })

  beforeEach(() => (inputs = {}))

  test('gets branch from ref', async () => {
    expect(helpers.getBranchFromRef('refs/heads/main')).toEqual('main')
    expect(helpers.getBranchFromRef('refs/heads/release/0.0.1')).toEqual(
      'release'
    )
    expect(helpers.getBranchFromRef('refs/heads/my-branch-name')).toEqual(
      'my-branch-name'
    )
    expect(() => helpers.getBranchFromRef('refs/heads/')).toThrow(
      `Github ref (refs/heads/) is malformed. Should be in refs/heads/branch-name format`
    )
  })

  test('user parameters are formatted', async () => {
    inputs.secrets = '{}'
    expect(helpers.getInput('secrets')).toEqual('{}')
    inputs.ignore_errors = 'false'
    expect(helpers.getInput<boolean>('ignore_errors')).toEqual(false)
    inputs.ignore_errors = 'true'
    expect(helpers.getInput<boolean>('ignore_errors')).toEqual(true)
  })

  describe('dotenv generation', () => {
    beforeEach(() => {
      inputs.secrets =
        '{"MAIN_SECRET":"no-sir","MAIN_SECRET":"main","MAIN_S":"t","STAGING_SECRET":"staging","CUSTOM_BRANCH_SECRET":"custom","DUPLICATE":"first","DUPLICATE":"second","SECRET":"t"}'
      inputs.branches = 'main,staging,custom-branch'
    })
    test('valid', () => {
      github.context.ref = 'refs/heads/main'
      expect(helpers.toEnv()).toEqual(`SECRET=main\nS=t\nDUPLICATE=second`)
      github.context.ref = 'refs/heads/custom-branch'
      expect(helpers.toEnv()).toEqual('SECRET=custom\nDUPLICATE=second')
    })
    test('invalid', () => {
      github.context.ref = 'refs/heads/invalid-branch'
      expect(() => helpers.toEnv()).toThrow(
        `Active branch (invalid-branch) is not contained in the branches parameter (main,staging,custom-branch). Ensure this only runs on valid branches or pass ignore_errors: true if you wish to continue without generating a branch specific .env file`
      )
    })
  })

  describe('run', () => {
  //   beforeEach(() => {
  //     process.env['INPUT_SECRETS'] =
  //       '{MAIN_SECRET":"main","DB_PASSWORD":"first","SECRET":"t"}'
  //   })
  //   // // shows how the runner will run a javascript action with env / stdout protocol
  //   test('action runs minimally', () => {
  //     const np = process.execPath
  //     const ip = path.join(__dirname, '..', 'dist', 'index.js')
  //     const options: cp.ExecFileSyncOptions = {
  //       env: process.env
  //     }
  //     try {
  //       cp.execFileSync(np, [ip], options)
  //     } catch (e) {
  //       console.error(e)
  //     }
  //   })
  //   test('action runs fully', () => {
  //     process.env['INPUT_OUTPUT_DIR'] = './test'
  //     process.env['INPUT_OUTPUT_NAME'] = 'prod.env'
  //     const np = process.execPath
  //     const ip = path.join(__dirname, '..', 'dist', 'index.js')
  //     const options: cp.ExecFileSyncOptions = {
  //       env: process.env
  //     }
  //     cp.execFileSync(np, [ip], options)
  //   })
  // })
})
