import { defineConfig } from "vitest/config";
import viteTsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";
import * as path from "node:path";
import { viteStaticCopy, TransformOption } from "vite-plugin-static-copy";

// These are the dependencies that will not be bundled into the library.
const EXTERNAL_DEPS = [
    "yargs",
    "prettier",
    "node:fs/promises",
    "node:util",
    "node:path",
];

// A build configuration for the library version of the build.
export default defineConfig({
    plugins: [
        viteTsconfigPaths(),
        dts({
            insertTypesEntry: true,
        }),
        viteStaticCopy({
            targets: [
                {
                    src: "package.json",
                    dest: "./",
                    transform: transformPackageJson,
                },
            ],
        }),
    ],
    build: {
        lib: {
            entry: { index: "scripts/generate-typescript.ts" },
            formats: ["es"],
        },
        outDir: "dist-cli",
        sourcemap: true,
        rollupOptions: {
            external: EXTERNAL_DEPS,
            output: {
                globals: Object.fromEntries(
                    EXTERNAL_DEPS.map((dep) => [dep, dep]),
                ),
            },
        },
    },

    test: {
        globals: true,
    },
});

/**
 * Trim and modify the `package.json` file so that it is suitable for publishing.
 */
function transformPackageJson(contents: string, filePath: string) {
    const pkg = JSON.parse(contents);
    const allDeps = {
        ...pkg.dependencies,
        ...pkg.peerDependencies,
        ...pkg.devDependencies,
    };
    // Delete unneeded entries
    delete pkg.private;
    delete pkg.scripts;
    delete pkg.devDependencies;
    delete pkg.peerDependencies;
    delete pkg.dependencies;
    delete pkg.prettier;

    // Everything that is externalized should be a peer dependency
    pkg.devDependencies = {};
    for (const dep of EXTERNAL_DEPS) {
        if (!allDeps[dep]) {
            console.warn(
                dep,
                "is listed as a dependency for vite to externalize, but a version is not specified in package.json.",
            );
            continue;
        }
        pkg.devDependencies[dep] = allDeps[dep];
    }

    // Fix up the paths. The existing package.json refers to files in the `./dist` directory. But
    // the new package.json will be in the ./dist directory itself, so we need to remove any `./dist`
    // prefix from the paths.
    const outputPackageJsonPath = path.join(
        path.dirname(filePath),
        "./dist/package.json",
    );
    if (Array.isArray(pkg.files)) {
        pkg.files = pkg.files.map((file) =>
            getPathRelativeToPackageJson(file, outputPackageJsonPath),
        );
    }
    for (const exp of Object.values(pkg.exports ?? {}) as Record<
        string,
        string
    >[]) {
        for (const [format, path] of Object.entries(exp)) {
            exp[format] = getPathRelativeToPackageJson(
                path,
                outputPackageJsonPath,
            );
        }
    }

    return JSON.stringify(pkg, null, 4);
}

function getPathRelativeToPackageJson(
    relPath: string,
    packageJsonPath: string,
) {
    const packageJsonDir = path.dirname(packageJsonPath);
    return "./" + path.relative(packageJsonDir, path.join(__dirname, relPath));
}
