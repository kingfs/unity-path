import * as fs from 'fs'
import { isString } from 'lodash'
import * as pify from 'pify'
import * as process from 'process'

const unityInstallPaths = [
  '/opt/Unity/Editor/Unity',
  '/Applications/Unity/Unity.app/Contents/MacOS/Unity',
  'C:\\Program Files\\Unity\\Editor\\Unity.exe',
  'C:\\Program Files (x86)\\Unity\\Editor\\Unity.exe',
]

export function unityPath(path?: string|string[]): Promise<string> {
  // if no argument is given, act as a getter.
  if (path === undefined || path === null) {
    // if the sessions' saved path is valid, return it immediately
    if (isString(process.env.UNITY_PATH) && process.env.UNITY_PATH.length >= 1) {
      // clean up the path
      const trimmedPath = process.env.UNITY_PATH.trim()
      if (trimmedPath !== process.env.UNITY_PATH) {
        return unityPath(trimmedPath)
      } else {
        return Promise.resolve(process.env.UNITY_PATH)
      }
    }
    // if not present, use defaults
    else {
      return unityPath(unityInstallPaths)
    }
  }
  // if the argument is a string, act as a setter and resolve it as the Unity install path.
  // if the provided string is invalid, on re-invocation defaults will be restored.
  else if (isString(path)) {
    path = path as string
    process.env.UNITY_PATH = path.trim()
    return unityPath()
  }
  // if the argument is an array, try the paths specified.
  // the provided order of the paths determines their priority when checking if the executable exists.
  else if (Array.isArray(path)) {
    const paths = path as string[]
    if (paths.length <= 0) { return unityPath() }

    // based on mitmadness/UnityInvoker
    return paths.reduce((acc, curr) =>
      acc.then(
        (val) => Promise.resolve(val),
        (err) => pify(fs.access)(curr, fs.constants.X_OK)
                 .then((_) => Promise.resolve(curr), (_) => Promise.reject(err)),
      ),
      Promise.reject(
        `Unable to locate Unity installation, tried all of these paths: ` +
        `${paths.map((p) => `"${p}"`).join(', ')}. ` +
        `Try setting env 'UNITY_PATH' or supplying a path to check as first argument.`,
      ))
  } else {
    return Promise.reject(
      `Could not understand input as a valid argument: "${path}". ` +
      `A valid argument is either a path (or series of paths) to try.`,
    )
  }
}
