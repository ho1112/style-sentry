
module.exports = {
  rules: {
    'no-unused-classes': true,
    'design-system-colors': {
      allowedColors: ['#FFFFFF', '#000000', 'blue', 'red', 'green'],
    },
    'numeric-property-limits': {
      'z-index': { threshold: 100, operator: '>=' },
      'font-size': { threshold: 32, operator: '>=' },
      'width': { threshold: 1200, operator: '>' }, // ex: Warning if width exceeds 1200px
      'height': { threshold: 800, operator: '>=' }, // ex: Warning if height exceeds 8000px
    },
  },
};
