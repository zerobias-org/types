import { expect } from 'chai';
import { PropertySelector } from '../../src/index.js';

describe('PropertySelector', () => {
  let selector: PropertySelector;

  beforeEach(() => {
    selector = new PropertySelector();
  });

  describe('select()', () => {
    it('should return full object when properties is undefined', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const result = selector.select(data, undefined);
      expect(result).to.deep.equal(data);
    });

    it('should return full object when properties is empty array', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const result = selector.select(data, []);
      expect(result).to.deep.equal(data);
    });

    it('should return null when input is null', () => {
      const result = selector.select(null, ['name']);
      expect(result).to.be.null;
    });

    it('should return undefined when input is undefined', () => {
      const result = selector.select(undefined, ['name']);
      expect(result).to.be.undefined;
    });

    it('should select a single top-level property', () => {
      const data = { name: 'John', email: 'john@example.com', phone: '123' };
      const result = selector.select(data, ['email']);
      expect(result).to.deep.equal({ email: 'john@example.com' });
    });

    it('should select multiple top-level properties', () => {
      const data = { name: 'John', email: 'john@example.com', phone: '123' };
      const result = selector.select(data, ['name', 'email']);
      expect(result).to.deep.equal({ name: 'John', email: 'john@example.com' });
    });

    it('should ignore non-existent properties', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const result = selector.select(data, ['name', 'nonexistent']);
      expect(result).to.deep.equal({ name: 'John' });
    });

    it('should select nested property with dot notation', () => {
      const data = {
        name: 'John',
        contact: { phone: '123', email: 'john@example.com', address: '456 Main St' }
      };
      const result = selector.select(data, ['contact.phone']);
      expect(result).to.deep.equal({ contact: { phone: '123' } });
    });

    it('should select multiple nested properties', () => {
      const data = {
        name: 'John',
        contact: { phone: '123', email: 'john@example.com', address: '456 Main St' }
      };
      const result = selector.select(data, ['name', 'contact.phone', 'contact.email']);
      expect(result).to.deep.equal({
        name: 'John',
        contact: { phone: '123', email: 'john@example.com' }
      });
    });

    it('should select deeply nested properties', () => {
      const data = {
        user: {
          profile: {
            contact: {
              phone: '123',
              email: 'john@example.com'
            }
          }
        }
      };
      const result = selector.select(data, ['user.profile.contact.phone']);
      expect(result).to.deep.equal({
        user: { profile: { contact: { phone: '123' } } }
      });
    });

    it('should handle mixed top-level and nested properties', () => {
      const data = {
        id: '1',
        name: 'John',
        contact: { phone: '123', email: 'john@example.com' },
        metadata: { created: '2023-01-01' }
      };
      const result = selector.select(data, ['id', 'contact.email', 'metadata.created']);
      expect(result).to.deep.equal({
        id: '1',
        contact: { email: 'john@example.com' },
        metadata: { created: '2023-01-01' }
      });
    });

    it('should ignore nested property when parent does not exist', () => {
      const data = { name: 'John' };
      const result = selector.select(data, ['name', 'contact.phone']);
      expect(result).to.deep.equal({ name: 'John' });
    });

    it('should ignore nested property when parent is not an object', () => {
      const data = { name: 'John', contact: 'not an object' };
      const result = selector.select(data, ['name', 'contact.phone']);
      expect(result).to.deep.equal({ name: 'John' });
    });
  });

  describe('normalizeFieldName()', () => {
    it('should convert to lowercase', () => {
      expect(selector.normalizeFieldName('Email')).to.equal('email');
      expect(selector.normalizeFieldName('EMAIL')).to.equal('email');
      expect(selector.normalizeFieldName('eMaIl')).to.equal('email');
    });

    it('should remove hyphens', () => {
      expect(selector.normalizeFieldName('e-mail')).to.equal('email');
      expect(selector.normalizeFieldName('first-name')).to.equal('firstname');
      expect(selector.normalizeFieldName('e-mail-address')).to.equal('emailaddress');
    });

    it('should remove underscores', () => {
      expect(selector.normalizeFieldName('email_address')).to.equal('emailaddress');
      expect(selector.normalizeFieldName('first_name')).to.equal('firstname');
      expect(selector.normalizeFieldName('phone_number')).to.equal('phonenumber');
    });

    it('should remove spaces', () => {
      expect(selector.normalizeFieldName('first name')).to.equal('firstname');
      expect(selector.normalizeFieldName('phone number')).to.equal('phonenumber');
    });

    it('should handle camelCase by lowercasing', () => {
      expect(selector.normalizeFieldName('emailAddress')).to.equal('emailaddress');
      expect(selector.normalizeFieldName('firstName')).to.equal('firstname');
      expect(selector.normalizeFieldName('phoneNumber')).to.equal('phonenumber');
    });

    it('should handle mixed separators', () => {
      expect(selector.normalizeFieldName('e-mail_Address')).to.equal('emailaddress');
      expect(selector.normalizeFieldName('First-Name_here')).to.equal('firstnamehere');
    });
  });

  describe('matchesField()', () => {
    it('should match exact field names', () => {
      expect(selector.matchesField('email', 'email')).to.be.true;
      expect(selector.matchesField('name', 'name')).to.be.true;
    });

    it('should match case-insensitive', () => {
      expect(selector.matchesField('email', 'Email')).to.be.true;
      expect(selector.matchesField('Email', 'email')).to.be.true;
      expect(selector.matchesField('EMAIL', 'email')).to.be.true;
    });

    it('should match hyphenated fields', () => {
      expect(selector.matchesField('email', 'e-mail')).to.be.true;
      expect(selector.matchesField('e-mail', 'email')).to.be.true;
      expect(selector.matchesField('firstname', 'first-name')).to.be.true;
    });

    it('should match underscored fields', () => {
      expect(selector.matchesField('firstname', 'first_name')).to.be.true;
      expect(selector.matchesField('first_name', 'firstname')).to.be.true;
      expect(selector.matchesField('phonenumber', 'phone_number')).to.be.true;
    });

    it('should match camelCase fields', () => {
      expect(selector.matchesField('firstname', 'firstName')).to.be.true;
      expect(selector.matchesField('firstName', 'firstname')).to.be.true;
      expect(selector.matchesField('phonenumber', 'phoneNumber')).to.be.true;
    });

    it('should NOT match different fields', () => {
      expect(selector.matchesField('email', 'username')).to.be.false;
      expect(selector.matchesField('phone', 'email')).to.be.false;
      expect(selector.matchesField('name', 'email')).to.be.false;
    });

    it('should NOT match partial field names', () => {
      // "phone" should NOT match "phonenumber" - they are different words
      expect(selector.matchesField('phone', 'phoneNumber')).to.be.false;
      expect(selector.matchesField('phone', 'phone_number')).to.be.false;
      expect(selector.matchesField('email', 'emailAddress')).to.be.false;
    });
  });

  describe('fuzzy matching in select()', () => {
    it('should select using hyphenated field name', () => {
      const data = { 'e-mail': 'john@example.com', name: 'John' };
      const result = selector.select(data, ['email']);
      expect(result).to.deep.equal({ 'e-mail': 'john@example.com' });
    });

    it('should select using underscored field name', () => {
      const data = { first_name: 'John', last_name: 'Doe' };
      const result = selector.select(data, ['firstname', 'lastname']);
      expect(result).to.deep.equal({ first_name: 'John', last_name: 'Doe' });
    });

    it('should select using camelCase field name', () => {
      const data = { firstName: 'John', lastName: 'Doe' };
      const result = selector.select(data, ['firstname', 'lastname']);
      expect(result).to.deep.equal({ firstName: 'John', lastName: 'Doe' });
    });

    it('should select nested property with fuzzy parent matching', () => {
      const data = {
        'contact-info': { phone: '123', email: 'john@example.com' }
      };
      const result = selector.select(data, ['contactinfo.phone']);
      expect(result).to.deep.equal({ 'contact-info': { phone: '123' } });
    });

    it('should select nested property with fuzzy child matching', () => {
      const data = {
        contact: { 'phone-number': '123', 'e-mail': 'john@example.com' }
      };
      const result = selector.select(data, ['contact.phonenumber', 'contact.email']);
      expect(result).to.deep.equal({
        contact: { 'phone-number': '123', 'e-mail': 'john@example.com' }
      });
    });
  });

  describe('selectFromArray()', () => {
    it('should return original array when properties is undefined', () => {
      const items = [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' }
      ];
      const result = selector.selectFromArray(items, undefined);
      expect(result).to.deep.equal(items);
    });

    it('should return original array when properties is empty', () => {
      const items = [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' }
      ];
      const result = selector.selectFromArray(items, []);
      expect(result).to.deep.equal(items);
    });

    it('should select properties from all items in array', () => {
      const items = [
        { name: 'John', email: 'john@example.com', phone: '123' },
        { name: 'Jane', email: 'jane@example.com', phone: '456' }
      ];
      const result = selector.selectFromArray(items, ['name', 'email']);
      expect(result).to.deep.equal([
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' }
      ]);
    });

    it('should select nested properties from array items', () => {
      const items = [
        { name: 'John', contact: { phone: '123', email: 'john@example.com' } },
        { name: 'Jane', contact: { phone: '456', email: 'jane@example.com' } }
      ];
      const result = selector.selectFromArray(items, ['name', 'contact.email']);
      expect(result).to.deep.equal([
        { name: 'John', contact: { email: 'john@example.com' } },
        { name: 'Jane', contact: { email: 'jane@example.com' } }
      ]);
    });

    it('should handle empty array', () => {
      const result = selector.selectFromArray([], ['name']);
      expect(result).to.deep.equal([]);
    });
  });

  describe('edge cases', () => {
    it('should handle objects with numeric keys', () => {
      const data = { '0': 'zero', '1': 'one', name: 'test' };
      const result = selector.select(data, ['name']);
      expect(result).to.deep.equal({ name: 'test' });
    });

    it('should handle empty nested objects', () => {
      const data = { name: 'John', contact: {} };
      const result = selector.select(data, ['name', 'contact.phone']);
      expect(result).to.deep.equal({ name: 'John' });
    });

    it('should handle arrays as property values', () => {
      const data = { name: 'John', tags: ['a', 'b', 'c'] };
      const result = selector.select(data, ['name', 'tags']);
      expect(result).to.deep.equal({ name: 'John', tags: ['a', 'b', 'c'] });
    });

    it('should handle nested arrays', () => {
      const data = {
        name: 'John',
        contacts: [
          { type: 'email', value: 'john@example.com' },
          { type: 'phone', value: '123' }
        ]
      };
      const result = selector.select(data, ['name', 'contacts']);
      expect(result).to.deep.equal({
        name: 'John',
        contacts: [
          { type: 'email', value: 'john@example.com' },
          { type: 'phone', value: '123' }
        ]
      });
    });

    it('should handle boolean values', () => {
      const data = { name: 'John', active: true, verified: false };
      const result = selector.select(data, ['active', 'verified']);
      expect(result).to.deep.equal({ active: true, verified: false });
    });

    it('should handle null property values', () => {
      const data = { name: 'John', email: null };
      const result = selector.select(data, ['name', 'email']);
      expect(result).to.deep.equal({ name: 'John', email: null });
    });

    it('should handle Date objects', () => {
      const date = new Date('2023-01-01');
      const data = { name: 'John', created: date };
      const result = selector.select(data, ['created']);
      expect(result).to.deep.equal({ created: date });
    });
  });
});
