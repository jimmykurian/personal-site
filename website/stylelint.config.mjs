// Stylelint for the CSS in src/styles/ and in .astro style blocks (task lint:css).
/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-html/astro'],
  rules: {
    // Class names are BEM: block__element--modifier.
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      { message: 'Use lowercase BEM class names: block__element--modifier' },
    ],
    // Astro's :global() reaches markup outside a component's scope.
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
    // The site writes media queries as (min-width: 720px).
    'media-feature-range-notation': 'prefix',
    // A font family name in the font-stack tokens.
    'value-keyword-case': ['lower', { ignoreKeywords: ['Georgia'] }],
    // The tokens in :root are grouped with blank lines.
    'custom-property-empty-line-before': null,
  },
};
