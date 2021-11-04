import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'
import {getBranchFromRef} from '../src/helpers/get-branch-from-ref'

test('gets branch from ref', async () => {
  expect(getBranchFromRef('refs/heads/main')).toEqual('main')
  expect(() => getBranchFromRef('refs/heads/')).toThrow(
    'Github ref is malformed'
  )
})

// shows how the runner will run a javascript action with env / stdout protocol
test('action runs minimally', () => {
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  cp.execFileSync(np, [ip], options)
})

test('action runs fully', () => {
  process.env['INPUT_OUTPUT_DIR'] = './test'
  process.env['INPUT_OUTPUT_NAME'] = 'prod.env'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  cp.execFileSync(np, [ip], options)
})
