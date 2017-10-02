import fs from 'fs'
import pify from 'pify'
import isString from 'is-string'
import isArray from 'is-array'

const unityInstallPaths = [
  '/opt/Unity/Editor/Unity',
  '/Applications/Unity/Unity.app/Contents/MacOS/Unity',
  'C:\\Program Files\\Unity\\Editor\\Unity.exe',
  'C:\\Program Files (x86)\\Unity\\Editor\\Unity.exe'
]

let resolvedUnityPath: string = null

export default function unityPath(path?: string|string[]): Promise<string> {
  // if no argument is given, act as a getter.
  if (path === undefined) {
    // if the resolved path is valid, return it immediately
    if (isString(resolvedUnityPath)) {
      return Promise.resolve(resolvedUnityPath)
    }
    // otherwise check for the UNITY_PATH environment variable
    else if (isString(process.env.UNITY_PATH)) {
      return unityPath(process.env.UNITY_PATH)
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
    resolvedUnityPath = path
    return unityPath()
  }
  // if the argument is an array, try the paths specified.
  // the provided order of the paths determines their priority when checking if the executable exists.
  else if (isArray(path)) {
    let paths = path as Array<string>
    if (paths.length <= 0) return unityPath()

    paths.reduceRight((acc, curr) =>
      acc.then(
        val => Promise.resolve(val),
        err => pify(fs.access)(curr, fs.constants.X_OK).then(_ => curr)
      ),
      Promise.reject()
    )
    .then(
      val => Promise.resolve(val),
      err => Promise.reject(
        `Unable to locate Unity installation, tried all of these paths: ` +
        `${paths.map(p => `"{$p}"`).join(', ')}.` +
        `Try using unityPath('/path/to/unity/executable') before any other calls.`
      )
    )
  }
}
