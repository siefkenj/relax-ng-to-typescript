/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    // We want to compile everything in since we are importing ES modules and Jest doesn't natively understand them.
    transformIgnorePatterns: [],
    transform: {
        "\\.m?jsx?$": "esbuild-jest",
        "^.+\\.tsx?$": "esbuild-jest",
    },
    haste: {
        forceNodeFilesystemAPI: true,
    },
    modulePathIgnorePatterns: ["/dist/"],
};
