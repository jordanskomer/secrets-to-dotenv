/**
 * Extracts the branch name from the based in Github ref.
 * Example Ref: refs/heads/main would return main
 *
 * @param githubRef
 * @returns {string}
 * @author jordanskomer
 */
export const getBranchFromRef = (githubRef: string): string => {
  if (!/refs\/heads\/[\w-]+/.test(githubRef))
    throw new Error(
      `Github ref (${githubRef}) is malformed. Should be in refs/heads/branch-name format`
    )
  return githubRef.split('/')[2]
}
