import * as fs from 'fs';
import * as unityPath from './index';

import * as mocha from 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;

const unityInstallPaths = {
  'debian':   '/opt/Unity/Editor/Unity',
  'osx':      '/Applications/Unity/Unity.app/Contents/MacOS/Unity',
  'win':      'C:\\Program Files\\Unity\\Editor\\Unity.exe',
  'wow64':    'C:\\Program Files (x86)\\Unity\\Editor\\Unity.exe'
}

describe('unity-path', () => {
  it('should export a function by default', () => {
    expect(unityPath.default).to.be.a('function')
  })
  describe('unityPath()', () => {
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
      let debianStub = sinon.stub().callsArgWithAsync(2, new Error('<error>'))
      let osxStub = sinon.stub().callsArgWithAsync(2, new Error('<error>'))
      let winStub = sinon.stub().callsArgWithAsync(2, new Error('<error>'))
      let wow64Stub = sinon.stub().callsArgWithAsync(2, new Error('<error>'))
      // wire up stubs
      access.withArgs(unityInstallPaths.debian).callsFake(debianStub)
      access.withArgs(unityInstallPaths.osx).callsFake(osxStub)
      access.withArgs(unityInstallPaths.win).callsFake(winStub)
      access.withArgs(unityInstallPaths.wow64).callsFake(wow64Stub)
      // test ordering
      return expect(unityPath.default())
        .to.be.rejected.and
        .then(() => {
          expect(debianStub).to.have.been.calledOnce
          expect(osxStub).to.have.been.calledOnce.and.calledAfter(debianStub)
          expect(winStub).to.have.been.calledOnce.and.calledAfter(osxStub)
          expect(wow64Stub).to.have.been.calledOnce.and.calledAfter(winStub)
        })
    })
    it('should find Unity at each default path', () => {
      //
    })
    it('should reject if Unity is not found at any of the default paths', () => {
      expect(unityPath.default()).to.be.rejectedWith(
        /^Unable to locate Unity installation, tried all of these paths:( "([^"]+)"[,\.]){4} Try setting env \'UNITY_PATH\' or supplying a path to check as first argument\.$/)
    })
  })
});
