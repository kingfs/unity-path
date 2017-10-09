import * as fs from 'fs';
import * as path from 'path';
import * as temp from 'temp';
import { unityPath } from './index';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

temp.track()
chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;

const unityInstallPaths = {
  debian:   '/opt/Unity/Editor/Unity',
  osx:      '/Applications/Unity/Unity.app/Contents/MacOS/Unity',
  win:      'C:\\Program Files\\Unity\\Editor\\Unity.exe',
  wow64:    'C:\\Program Files (x86)\\Unity\\Editor\\Unity.exe',
}

describe('unity-path', () => {
  beforeEach(() => {
    delete process.env.UNITY_PATH /* unset */
  })
  it('should export the function unityPath', () => {
    expect(unityPath).to.be.a('function')
  })
  describe('unityPath(): stubbed', () => {
    let access: sinon.SinonStub;
    beforeEach(() => {
      access = sinon.stub(fs, 'access')
      access.callsArgWithAsync(2, new Error('<error>'))
    })
    afterEach(() => {
      access.restore();
    })
    it('should try default paths in order', () => {
      // all stubs throw not found error
      const debianStub = sinon.stub().callsArgWithAsync(2, new Error('<error>'))
      const osxStub = sinon.stub().callsArgWithAsync(2, new Error('<error>'))
      const winStub = sinon.stub().callsArgWithAsync(2, new Error('<error>'))
      const wow64Stub = sinon.stub().callsArgWithAsync(2, new Error('<error>'))
      // wire up stubs
      access.withArgs(unityInstallPaths.debian).callsFake(debianStub)
      access.withArgs(unityInstallPaths.osx).callsFake(osxStub)
      access.withArgs(unityInstallPaths.win).callsFake(winStub)
      access.withArgs(unityInstallPaths.wow64).callsFake(wow64Stub)
      // test ordering
      return expect(unityPath())
        .to.be.rejected.and
        .then(() => {
          expect(debianStub).to.have.been.calledOnce
          expect(osxStub).to.have.been.calledOnce.and.calledAfter(debianStub)
          expect(winStub).to.have.been.calledOnce.and.calledAfter(osxStub)
          expect(wow64Stub).to.have.been.calledOnce.and.calledAfter(winStub)
        })
    })
    it('should resolve Unity at default path on Debian/Ubuntu', () => {
      const debianStub = sinon.stub().callsArgAsync(2)
      access.withArgs(unityInstallPaths.debian).callsFake(debianStub)
      return expect(unityPath()).to.eventually.equal(unityInstallPaths.debian)
    })
    it('should resolve Unity at default path on OS X', () => {
      const osxStub = sinon.stub().callsArgAsync(2)
      access.withArgs(unityInstallPaths.osx).callsFake(osxStub)
      return expect(unityPath()).to.eventually.equal(unityInstallPaths.osx)
    })
    it('should resolve Unity at default path on Windows', () => {
      const winStub = sinon.stub().callsArgAsync(2)
      access.withArgs(unityInstallPaths.win).callsFake(winStub)
      return expect(unityPath()).to.eventually.equal(unityInstallPaths.win)
    })
    it('should resolve Unity at default path on Windows/WOW64', () => {
      const wow64Stub = sinon.stub().callsArgAsync(2)
      access.withArgs(unityInstallPaths.wow64).callsFake(wow64Stub)
      return expect(unityPath()).to.eventually.equal(unityInstallPaths.wow64)
    })
    it('should reject if Unity is not found at any of the default paths', () => {
      expect(unityPath()).to.be.rejectedWith(
        // tslint:disable-next-line:max-line-length
        /^Unable to locate Unity installation, tried all of these paths:( "([^"]{10,})"[,\.]){4} Try setting env \'UNITY_PATH\' or supplying a path to check as first argument\.$/)
    })
    it('should check env UNITY_PATH rather than the default search paths if it\'s valid', () => {
      process.env.UNITY_PATH = path.resolve(temp.mkdirSync('unity-path-tests'), 'Unity')
      return expect(unityPath()).to.eventually.equal(process.env.UNITY_PATH)
    })
    it('should still access the default search locations if env UNITY_PATH is set without a value', () => {
      process.env.UNITY_PATH = ''
      return expect(unityPath()).to.be.rejected;
    })
  })
  describe('unityPath(path: string)', () => {
    it('should throw an exception if given a path that is of invalid type', () => {
      return expect(unityPath({} as any))
        .to.be.rejectedWith(
          // tslint:disable-next-line:max-line-length
          /^Could not understand input as a valid argument: "[^"]{5,}"\. A valid argument is either a path \(or series of paths\) to try\.$/,
        )
    })
    it('should check the provided path rather than the default search paths', () => {
      const tmpDir = temp.mkdirSync('unity-path-tests')
      const binPath = path.resolve(tmpDir, 'Unity')
      fs.writeFileSync(binPath, '#/bin/sh\nexit 0')
      return expect(unityPath(binPath))
        .to.be.fulfilled
        .then((result) => {
          expect(result).to.be.a('string').that.is.not.null
          expect(result).to.equal(binPath)
        })
    })
    it('should save the returned path as env UNITY_PATH so that repeated invocations re-use it', () => {
      const tmpDir = temp.mkdirSync('unity-path-tests')
      const binPath = path.resolve(tmpDir, 'Unity')
      fs.writeFileSync(binPath, '#/bin/sh\nexit 0')
      return expect(unityPath(binPath))
        .to.be.fulfilled
        .then((result) => {
          expect(process.env.UNITY_PATH).to.equal(binPath)
        })
    })
    it('should be possible to manually overwrite the path that has been resolved', () => {
      const tmpDir = temp.mkdirSync('unity-path-tests')
      const binPath1 = path.resolve(tmpDir, 'Unity1')
      const binPath2 = path.resolve(tmpDir, 'Unity2')
      fs.writeFileSync(binPath1, '#/bin/sh\nexit 0')
      fs.writeFileSync(binPath2, '#/bin/sh\nexit 0')
      // invoke with specific path to first Unity binary
      return expect(unityPath(binPath1))
        .to.be.fulfilled
        .then((first) => {
          expect(first).to.be.a('string').that.is.not.null
          expect(process.env.UNITY_PATH).to.equal(binPath1)
          expect(first).to.equal(binPath1)
          // invoke with specific path to second Unity binary, check it is overriden
          return expect(unityPath(binPath2))
            .to.be.fulfilled
            .then((second) => {
              expect(second).to.be.a('string').that.is.not.null
              expect(second).not.to.be.equal(first)
              expect(second).to.equal(binPath2)
            })
        })
    })
    it('should trim a path that is padded with spaces', () => {
      const tmpDir = temp.mkdirSync('unity-path-tests')
      const binPath = path.resolve(tmpDir, 'Unity')
      const paddedBinPath = '   ' + binPath + '   '
      fs.writeFileSync(binPath, '#/bin/sh\nexit 0')
      return expect(unityPath(paddedBinPath))
        .to.be.fulfilled
        .then((result) => {
          expect(result).to.be.a('string').that.is.not.null
          expect(process.env.UNITY_PATH).to.equal(binPath)
          expect(result).not.to.equal(paddedBinPath)
          expect(result).to.equal(binPath)
        })
    })
    it('should trim env UNITY_PATH if it has been padded with spaces', () => {
      const tmpDir = temp.mkdirSync('unity-path-tests')
      const binPath = path.resolve(tmpDir, 'Unity')
      const paddedBinPath = '   ' + binPath + '   '
      fs.writeFileSync(binPath, '#/bin/sh\nexit 0')
      process.env.UNITY_PATH = paddedBinPath
      return expect(unityPath())
        .to.be.fulfilled
        .then((result) => {
          expect(result).to.be.a('string').that.is.not.null
          expect(process.env.UNITY_PATH).to.equal(binPath)
          expect(result).not.to.equal(paddedBinPath)
          expect(result).to.equal(binPath)
        })
    })
  })
  describe('unityPath(paths: string[])', () => {
    let access: sinon.SinonStub;
    beforeEach(() => {
      access = sinon.stub(fs, 'access')
      access.callsArgWithAsync(2, new Error('<error>'))
    })
    afterEach(() => {
      access.restore();
    })
    it('should check the provided array of paths rather than the default search paths', () => {
      const tmpDir = temp.mkdirSync('unity-path-tests')
      const fakePathToUnity = path.resolve(tmpDir, 'Unity_fake')
      const myPaths = [unityInstallPaths.win, unityInstallPaths.wow64, fakePathToUnity]
      // all stubs throw not found error
      const debianStub = sinon.stub().callsArgWithAsync(2, new Error('<error>'))
      const osxStub = sinon.stub().callsArgWithAsync(2, new Error('<error>'))
      const winStub = sinon.stub().callsArgWithAsync(2, new Error('<error>'))
      const wow64Stub = sinon.stub().callsArgWithAsync(2, new Error('<error>'))
      const fakePathToUnityStub = sinon.stub().callsArgWithAsync(2, new Error('<error>'))
      // wire up stubs
      access.withArgs(unityInstallPaths.debian).callsFake(debianStub)
      access.withArgs(unityInstallPaths.osx).callsFake(osxStub)
      access.withArgs(unityInstallPaths.win).callsFake(winStub)
      access.withArgs(unityInstallPaths.wow64).callsFake(wow64Stub)
      access.withArgs(fakePathToUnity).callsFake(fakePathToUnityStub)
      return expect(unityPath(myPaths))
        .to.be.rejected
        .then(() => {
          expect(access)
          expect(winStub).to.be.calledOnce
          expect(wow64Stub).to.be.calledOnce
          expect(fakePathToUnityStub).to.be.calledOnce
          expect(debianStub).not.to.be.called
          expect(osxStub).not.to.be.called
        })
    })
    it('should behave the same as unityPath() if an empty list is passed', () => {
      const myPaths = []
      return expect(unityPath(myPaths))
        .to.be.rejected
        .then(() => {
          expect(access.callCount).to.equal(4)
        })
    })
  })
});
