import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as pify from 'pify'
import * as temp from 'temp';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as mocha from 'mocha';

temp.track()
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('bin/unity-path', () => {
  it('exits with code 0 when everything is fine', () => {
    const tmpDir = temp.mkdirSync('unity-bin-tests')
    const binPath = path.resolve(tmpDir, 'Unity')
    fs.writeFileSync(binPath, '#/bin/sh\nexit 0')
    fs.chmodSync(binPath, '755')
    return expect(pify(child_process.exec, { multiArgs: true })
      (`./bin/unity-path "${binPath}"`))
      .to.be.fulfilled
      .then((result) => {
        const [error, stdout, stderr] = result;
        expect(error).not.to.be.a('Error')
        expect(error.code).to.be.undefined
      })
  })
  it('exits with code 1 when there is an error', () => {
    const tmpDir = temp.mkdirSync('unity-bin-tests')
    const binPath = path.resolve(tmpDir, 'Unity')
    // do not write the file
    return expect(pify(child_process.exec, { multiArgs: true })
      (`./bin/unity-path "${binPath}"`))
      .to.be.rejected
      .then((result) => {
        const [error, stdout, stderr] = result;
        expect(error).to.be.a('Error')
        expect(error.code).to.equal(1)
      })
  })
})
