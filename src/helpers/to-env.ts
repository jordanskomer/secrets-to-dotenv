import {getBranchFromRef, getInput} from '.'
import {context} from '@actions/github'
import {debug} from '@actions/core'

/**
 * Takes a name and converts it to uppercase and append a _ at the end to
 * ensure the branchName matches the key naming convention from Github secrets
 *
 * @example formatKeyPrefix('main') return 'MAIN_'
 * @example formatKeyPrefix('release') return 'RELEASE_'
 * @param branchName -
 * @author jordanskomer
 */
const formatKeyPrefix = (name: string): string =>
  `${name.replace(/-/, '_').toUpperCase()}_`

const formatToLine = (key: string, value: string): string => `${key}=${value}`

/**
 * Converts the passed in secrets object into a formatted .env file
 * @param secrets
 * @param determineKey
 * @returns {string} - The .env file in string format
 * @author jordanskomer
 */
const toDotEnv = (
  secrets: Record<string, string>,
  determineKey?: (key: string) => string | undefined
): string => {
  // Used to ensure if we happen upon secrets later on in the flow that we've replaced with our branch
  // specific key it will ignore the one and use the branch specific one
  const branchOverriddenKeys: string[] = []

  // Ensure we don't override keys
  const dotenv: Record<string, string> = {}
  for (const m of Object.keys(secrets)) {
    if (typeof determineKey === 'undefined') {
      dotenv[m] = formatToLine(m, secrets[m])
    } else {
      const key = determineKey(m)
      // If the key we determined matches what we already had we know it's not one we will perform magic on
      const override = key !== m
      if (
        key &&
        (override || (!override && !branchOverriddenKeys.includes(key)))
      ) {
        branchOverriddenKeys.push(key)
        dotenv[key] = formatToLine(key, secrets[m])
      }
    }
  }
  return Object.values(dotenv).join('\n')
}

/**
 * Will filter out any secrets that do not match the current branch and add any secrets that do not
 * conform to the BRANCHNAME_ naming convention. Will then generate the .env from these filtered out secrets
 * @param secrets
 * @param validBranches
 * @author jordanskomer
 */
const secretsToBranchSpecificEnv = (
  secrets: Record<string, string>,
  validBranches: string[]
): string => {
  const branch = getBranchFromRef(context.ref)
  const branchPrefix = formatKeyPrefix(branch)
  const ignoredPrefixes = validBranches
    .filter(b => b !== branch)
    .map(formatKeyPrefix)

  if (ignoredPrefixes.length === validBranches.length)
    throw new Error(
      `Active branch (${branch}) is not contained in the branches parameter (${validBranches}). Ensure this only runs on valid branches or pass ignore_errors: true if you wish to continue without generating a branch specific .env file`
    )

  debug(`Creating .env for ${branchPrefix}. Ignoring ${ignoredPrefixes}`)
  return toDotEnv(secrets, key => {
    if (key.startsWith(branchPrefix)) {
      debug(`${key} matches our ${branchPrefix}`)
      return key.split(branchPrefix)[1]
    } else if (ignoredPrefixes.filter(p => key.startsWith(p)).length === 0) {
      return key
    }
    return undefined
  })
}

/**
 * Generates a .env file string using the user passed in parameters from the Github action
 *
 * @author jordanskomer
 */
export const toEnv = (): string => {
  const validBranches = (
    getInput<string>('branches') || 'main,staging,develop'
  ).split(',')
  const secrets = JSON.parse(getInput<string>('secrets'))
  const useBranches =
    !getInput<boolean>('ignore_branches') && validBranches.length

  debug(
    `Begin file generation using ${
      useBranches ? 'branch-specific' : 'normal'
    } methods`
  )

  const dotenv = useBranches
    ? secretsToBranchSpecificEnv(secrets, validBranches)
    : toDotEnv(secrets)

  debug(`Generated file contents`)
  debug(dotenv)

  return dotenv
}
