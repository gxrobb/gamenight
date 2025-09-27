import '@testing-library/jest-dom';

// Polyfill for structuredClone (needed for Chakra UI in Jest)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
