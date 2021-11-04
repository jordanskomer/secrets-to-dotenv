export const toEnv = (obj: Record<string, string>, branch: string): string => {
  const branchPrefix = branch.toLowerCase()
  let dotenv = ''
  const keys = Object.keys(obj)
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i]
    if (!key.toLowerCase().startsWith(branchPrefix)) {
      dotenv += `${key}=${obj[key]}\n`
    }
  }

  return dotenv
}
