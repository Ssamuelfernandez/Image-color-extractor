export default {
  
    projects: [
        {
          displayName: "node",
          testEnvironment: "node",
          testMatch: ["<rootDir>/__test__/node/**/*.[jt]s?(x)"],
          transform: {
            "^.+\\.[jt]sx?$": "babel-jest"
          }
        },
        {
          displayName: "browser",
          testEnvironment: "jsdom",
          testMatch: ["<rootDir>/__test__/browser/**/*.[jt]s?(x)"],
          setupFiles: ["<rootDir>/jest.setup.mjs"],
          transform: {
            "^.+\\.[jt]sx?$": "babel-jest"
          }
        }
      ]
  };