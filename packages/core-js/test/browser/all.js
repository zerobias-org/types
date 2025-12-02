const context = require.context('../../dist/test/unit', true, /.js$/);
context.keys().forEach(context);
module.exports = context;
