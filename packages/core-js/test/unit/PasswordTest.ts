 
import { expect } from 'chai';
import { CoreType, Type } from '../../src/index.js';
import { Password } from '../../src/types/Password.js';

describe('Password', function () {

  it('should return a description of the class', async function () {
      const desc = Password.description();
      expect(desc).to.be.ok;
      expect(desc).to.include('password');
  });

  it('should return examples for the class', async function () {
      const examples = Password.examples();
      expect(examples).to.be.ok;
  });

  it('should validate a valid password', async function () {
      const pwd = await Password.parse('somepassword');
      expect(pwd).to.be.ok;
      expect(pwd instanceof Password).to.be.true;
      expect(pwd.toString()).to.equal('somepassword');
  });

  it('should have the proper HTML input type', async function () {
    const ct = CoreType.get('password');
    expect(ct.htmlInput).to.be.eq(Type.HtmlInputEnum.Password);
  });
});
