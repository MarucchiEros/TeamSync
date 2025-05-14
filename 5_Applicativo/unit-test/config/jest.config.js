/**
 * Configurazione di Jest per l'ambiente di test dell'applicazione.
 *
 * - testEnvironment: utilizza jsdom per simulare il DOM nei test frontend.
 * - transform: usa babel-jest con preset-env per la compatibilità ES6+.
 * - moduleFileExtensions: estensioni dei file supportate.
 * - roots: directory radice dei test.
 * - transformIgnorePatterns: esclude node_modules eccetto alcune dipendenze.
 * - verbose: output dettagliato dei risultati dei test.
 *
 * @module JestConfig
 */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': ['babel-jest', { presets: ['@babel/preset-env'] }]
  },
  moduleFileExtensions: ['js', 'json'],
  roots: ['../'],
  transformIgnorePatterns: [
    '/node_modules/(?!(sequelize|uuid)/)'
  ],
  verbose: true,
}; 