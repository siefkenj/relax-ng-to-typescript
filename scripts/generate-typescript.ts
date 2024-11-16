/**
 * Create TypeScript files for a RELAX-NG grammar.
 *
 * To run:
 * node --experimental-specifier-resolution=node --loader ts-node/esm scripts/generate-typescript
 */

import fs from "node:fs/promises";
import util from "node:util";
import path from "node:path";
import yargs from "yargs/yargs";
import { toXml } from "xast-util-to-xml";
import Prettier from "prettier";
import { removePositionPlugin } from "../src";
import { doSimplificationPlugin } from "../src";
import { makeTypesForGrammar } from "../src";
import { unifiedXml } from "../tests/utils";
import { renameRefsPlugin } from "../src";
import chalk from "chalk";
import type { Root, Element as XMLElement, Text as XMLText } from "xast";

// Make console.log pretty-print by default
const origLog = console.log;
console.log = (...args) => {
    origLog(...args.map((x) => util.inspect(x, false, 20, true)));
};

const argv = yargs(process.argv.slice(2))
    .option("grammar", {
        alias: "g",
        type: "string",
        description: "RELAX-NG input grammar file (must be XML format)",
        required: true,
    })
    .option("out-dir", {
        alias: "o",
        type: "string",
        description: "Directory to output generated typescript file(s)",
        required: true,
    })
    .help()
    .alias("help", "h").argv;

async function main(grammarFile: string, outDir: string) {
    const processor = unifiedXml()
        .use(removePositionPlugin)
        .use(doSimplificationPlugin);
    origLog(chalk.red("Reading grammar from", grammarFile));
    const source = await fs.readFile(grammarFile, "utf-8");
    const parsed = processor.parse(source);
    let ast = processor.runSync(parsed as any as Root);
    ast = unifiedXml().use(renameRefsPlugin).runSync(ast);

    // Write out the intermediate (simplified) XML
    const formattedXml = await Prettier.format(toXml(ast as any as Root), { parser: "xml" });
    const xmlOutFile = path.join(outDir, "simplified-grammar.xml");
    origLog(chalk.red("Writing simplified grammar to", xmlOutFile));
    await fs.writeFile(xmlOutFile, formattedXml, "utf-8");

    const grammarTypes = makeTypesForGrammar(ast.children[0]);

    // Generate types
    const tsOutFile = path.join(outDir, "generated-types.ts");
    origLog(chalk.red("Writing generated types to", tsOutFile));
    const tsOut = grammarTypes.typescriptStr;
    await fs.writeFile(tsOutFile, tsOut, "utf-8");

    // Generate JSON grammar
    const jsonOutFile = path.join(outDir, "generated-grammar.ts");
    origLog(chalk.red("Writing JSON grammar to", jsonOutFile));
    const jsonOut = `export const jsonGrammar = ${JSON.stringify(
        grammarTypes.grammar,
        null,
        4
    )}`;
    await fs.writeFile(jsonOutFile, jsonOut, "utf-8");
}

(async () => {
    const args = await argv;
    await main(args.grammar, args["out-dir"]);
})();
