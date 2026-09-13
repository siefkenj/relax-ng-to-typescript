import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import util from "node:util";
import type { Root } from "xast";
import { unifiedXml } from "./utils";
import { renameRefsPlugin } from "../src";
import { removePositionPlugin } from "../src/xast-utils";
import { doSimplificationPlugin } from "../src/relax-ng/simplification/do-simplification-plugin";
import { makeTypesForGrammar } from "../src/relax-ng/typescript/make-type";

// Make console.log pretty-print by default
const origLog = console.log;
console.log = (...args) => {
    origLog(...args.map((x) => util.inspect(x, false, 10, true)));
};

/**
 * Simplify `source` and produce the TypeScript/JSON types for it.
 */
function typesForSource(source: string) {
    const processor = unifiedXml()
        .use(removePositionPlugin)
        .use(doSimplificationPlugin);
    const ast = processor.runSync(processor.parse(source) as any as Root);
    return makeTypesForGrammar(ast.children[0] as any);
}

describe("relax-ng-make-type", () => {
    it("reports a `startType` when `start` is a single ref", async () => {
        const { grammar, typescriptStr } = typesForSource(`<grammar>
            <start><ref name="ElementFoo"/></start>
            <define name="ElementFoo">
                <element name="foo"><ref name="ElementBar"/></element>
            </define>
            <define name="ElementBar">
                <element name="bar"><text/></element>
            </define>
        </grammar>`);

        expect(grammar.startType).toEqual("ElementFoo");
        // Everything reachable from the start element must be exported.
        expect(Object.keys(grammar.refs).sort()).toEqual([
            "ElementBar",
            "ElementFoo",
            "XMLText",
        ]);
        expect(typescriptStr).toContain("type StartElement = ElementFoo;");
    });

    it("reports a `startType` when `start` is a choice of refs", async () => {
        const { grammar, typescriptStr } = typesForSource(`<grammar>
            <start>
                <choice>
                    <choice>
                        <ref name="ElementFoo"/>
                        <ref name="ElementBar"/>
                    </choice>
                    <ref name="ElementBaz"/>
                </choice>
            </start>
            <define name="ElementFoo">
                <element name="foo"><text/></element>
            </define>
            <define name="ElementBar">
                <element name="bar"><text/></element>
            </define>
            <define name="ElementBaz">
                <element name="baz"><text/></element>
            </define>
        </grammar>`);

        // The first ref of the (possibly nested) choice is the start type.
        expect(grammar.startType).toEqual("ElementFoo");
        // Every start element is a valid document root, so all of them are exported.
        expect(Object.keys(grammar.refs).sort()).toEqual([
            "ElementBar",
            "ElementBaz",
            "ElementFoo",
            "XMLText",
        ]);
        expect(typescriptStr).toContain(
            "type StartElement = ElementFoo|ElementBar|ElementBaz;",
        );
    });

    it("reports a `startType` for the PreTeXt grammar", async () => {
        const processor = unifiedXml()
            .use(removePositionPlugin)
            .use(doSimplificationPlugin);
        const source = await fs.readFile("./resources/pretext.rng", "utf-8");
        let ast = processor.runSync(processor.parse(source) as any as Root);
        ast = unifiedXml().use(renameRefsPlugin).runSync(ast);

        const { grammar } = makeTypesForGrammar(ast.children[0] as any);

        // The exact ref name tracks the (vendored) schema, but the start type must
        // always be defined and must always resolve to the `<pretext>` element.
        expect(grammar.startType).toMatch(/^ElementPretext/);
        expect(grammar.refs[grammar.startType]).toMatchObject({
            type: "element",
            name: "pretext",
        });
    }, 20_000);
});
