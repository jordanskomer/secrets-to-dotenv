/**
 * Extracts the branch name from the based in Github ref.
 * Example Ref: refs/heads/main would return main
 *
 * @param githubRef
 * @returns {string}
 * @author jordanskomer
 */
export const getBranchFromRef = (githubRef: string): string => {
  if (!/[\w-]+\/[\w-]+\/[\w-]+/.test(githubRef))
    throw new Error('Github ref is malformed')
  return githubRef.split('/')[2]
}
