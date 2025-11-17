//export default {
  //testEnvironment: "node",
  //transform: {},
  //moduleFileExtensions: ["js", "json"],
  //coverageDirectory: "coverage",
  //roots: ["<rootDir>/tests"],
//};

export default {
  testEnvironment: "node",
  transform: {},

  // ---- COVERAGE SETTINGS ----
  collectCoverage: true,
  coverageReporters: ["text", "html", "lcov"],

  collectCoverageFrom: [
    "src/controllers/**/*.js",
    "src/middleware/**/*.js",
    "src/models/**/*.js",
    "src/routes/**/*.js",
    "!src/app.js",
    "!src/config/**",
    "!src/server.js"
  ],

  // ---- HTML TEST REPORT ----
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "./test-report",
        filename: "report.html",
        expand: true,
        openReport: false,
        pageTitle: "OnlyHands Test Report"
      }
    ]
  ]
};

