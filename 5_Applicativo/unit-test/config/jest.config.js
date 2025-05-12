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