module.exports = {
  rules: {
    // Rule: 'no-unused-classes'
    // Finds CSS classes that are defined but not used in your JSX/TSX files.
    // Enabled by default.
    'no-unused-classes': true,

    // Rule: 'design-system-colors'
    // Checks if the colors used are from your design system's palette.
    // To enable, uncomment the 'allowedColors' array and add your colors.
    'design-system-colors': {
      allowedColors: ['#FFFFFF', '#000000', 'blue', 'red', 'green'],
    },

    // Rule: 'numeric-property-limits'
    // Checks for limits on numeric CSS properties.
    // To enable, uncomment the properties you want to check.
    'numeric-property-limits': {
      'z-index': { threshold: 100, operator: '>=' },
      'font-size': { threshold: 32, operator: '>=' },
    },
  },
};
