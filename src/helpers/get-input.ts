import {InputOptions, getInput as coreGetInput} from '@actions/core'

/**
 * Definitely types the input variable names defined in our action.yml
 *
 * @author jordanskomer
 */
type ActionInput =
  | 'output_name'
  | 'output_dir'
  | 'branches'
  | 'secrets'
  | 'ignore_branches'
  | 'ignore_errors'

/**
 * Wraps around getInput from @actions/core to ensure the name is typed to coorespond with our action.yml
 *
 * @param name
 * @param options
 * @returns
 * @author jordanskomer
 */
export function getInput<T = string>(
  name: ActionInput,
  options?: InputOptions
): T {
  let input = coreGetInput(name, options) as unknown

  if (input === 'false' || input === 'true') {
    input = input === 'true'
  }
  return input as T
}
