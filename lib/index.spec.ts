import * as unityPath from './index';

import * as mocha from 'mocha';
import * as chai from 'chai';

const expect = chai.expect;

describe('unity-path', () => {
  it('should export a function' , () => {
    expect(unityPath.default).to.be.a('function')
    unityPath.default()
  });
  it('should work', () => {
    expect(unityPath.default()).to.be.a('Promise')
  })
});
