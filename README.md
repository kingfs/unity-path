<p align="center">
  <img alt="unity-path Mascot" src="http://www.catster.com/wp-content/uploads/2015/06/litter-tracking-box.jpg" width="400" />
</p>

<p align="center">
    <a href="https://twitter.com/home?status=me%20x%20unity-path%20%2C%20friends%20forever.%20%F0%9F%92%AB%20https%3A%2F%2Fgithub.com%2Fzettaforge%2Funity-path%20%23gamedev%20%23unity%20%23unity3d%20%40donkeybonks">
    <img alt="Share on Twitter" src="https://img.shields.io/twitter/url/http/shields.io.svg?style=social&maxAge=2592000" />
  </a><br/>
True friendship isn't about being there when it's convenient,<br/>it's about being there when it's not.</p>
<hr />
<p align="center">
  <a href="https://www.npmjs.com/package/unity-path">
    <img alt="npm" src="https://img.shields.io/npm/v/unity-path.svg" />
  </a>
  <a href="https://travis-ci.org/zettaforge/unity-path">
    <img alt="Build Status" src="https://travis-ci.org/zettaforge/unity-path.svg?branch=master" />
  </a>
  <a href="https://greenkeeper.io/">
    <img alt="Greenkeeper" src="https://badges.greenkeeper.io/zettaforge/unity-path.svg" />
  </a>
  <a href="https://david-dm.org/zettaforge/unity-path">
    <img alt="Greenkeeper" src="https://david-dm.org/zettaforge/unity-path/status.svg" />
  </a>
  <a href="https://coveralls.io/repos/github/zettaforge/unity-path/badge.svg?branch=master">
    <img alt="Coverage" src="https://coveralls.io/repos/github/zettaforge/unity-path/badge.svg?branch=master" />
  </a>
</p>
<hr />
<h1 align="center">unity-path</h1>

> A simple and robust way to determine where <a href="https://unity3d.com/">Unity3D</a> is installed in the current environment.
>
> I'm provided as a <a href="https://typescriptlang.org">Typescript</a>-compatible <a href="https://nodejs.org">Node.js</a> module, but also as a standalone command line utility. Under the hood I'm not that complex - just an environment variable wrapped in friendly glitter.

<h2 id="topics">Help Topics</h2>

* <a href="#install">Installation</a>
* <a href="#usage">Usage</a>
* <a href="#contributing">Contributing</a>
* <a href="#license">License</a>

<h2 id="install">Installation</h2>

For shell installations:
npm
```sh
npm install -g unity-path
```

For node project installations:
npm
```sh
npm i unity-path --save-dev
```

<h2 id="usage">Usage</h2>

For most use cases (involving default install locations), all you need to use is either:

Javascript:
```javascript
var unityPath = require('unity-path').unityPath

unityPath().then(function(path) {
  console.log('Unity is located at:', path);
})
```

Shell:
```sh
echo "Unity is located at: $(unity-path)"
```

Output:
```
Unity is located at: /Applications/Unity/Unity.app/Contents/MacOS/Unity
```
or
```
Unable to locate Unity installation, tried all of these paths: "/opt/Unity/Editor/Unity", "/Applications/Unity/Unity.app/Contents/MacOS/Unity", "C:\Program Files\Unity\Editor\Unity.exe", "C:\Program Files (x86)\Unity\Editor\Unity.exe". Try setting env 'UNITY_PATH' or supplying a path to check as first argument.
```

Both of these methods will set the environment variable `UNITY_PATH` on the first invocation. Any further invocations will simply read from this cached location. If you have installed Unity in a special location, you can set this from your equivalent of `.profile` or `.bash_profile` by running either:

Javascript:
```javascript
var unityPath = require('unity-path').unityPath

unityPath('/path/to/unity')
// or: unityPath(['/path/to/unity1', '/path/to/unity2'])
```

Shell:
```sh
unity-path "/path/to/unity"
```

Any further invocations on the system, even from deep within build tooling, will return this path instead. Variations of these scripts are included in the `./examples` directory of this source package.

<h2 id="contributing">Contributing</h2>

_For features_, please raise an issue suggesting the feature. If the feature request is given the green light, we will accept pull requests.

_For bugs_, please raise an issue notifying us of the bug. If you have a fix, you may raise a pull request immediately for code review, however you must ensure that good test coverage and high code quality is maintained.

Please also see <a href="./CODE_OF_CONDUCT.md">our contributing CODE_OF_CONDUCT</a>.

<h2 id="license">License</h2>

Licensed under the MIT License, see <a href="./LICENSE">LICENSE</a> for more information.
