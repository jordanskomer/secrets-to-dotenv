import {InputOptions, getInput as coreGetInput} from '@actions/core'

/**
 * Definitely types the input variable names defined in our action.yml
 *
 * @author jordanskomer
 */
type ActionInput = 'output_name' | 'output_dir' | 'secrets'

/**
 * Wraps around getInput from @actions/core to ensure the name is typed to coorespond with our action.yml
 *
 * @param name
 * @param options
 * @returns
 * @author jordanskomer
 */
export const getInput = (
  name: ActionInput,
  options?: InputOptions
): unknown => {
  return coreGetInput(name, options)
}
