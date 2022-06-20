import fs from "node:fs/promises";
import util from "node:util";
import Prettier from "prettier";
import { unifiedXml } from "./utils";
import {
    rule1,
    rule12,
    rule2,
    rule4,
    rule8,
} from "../src/relax-ng/simplification";
import { doSimplificationPlugin } from "../src/relax-ng/simplification/do-simplification-plugin";
import { extractRefs } from "../src/relax-ng/extract/extract-children";
import { NGSimpRoot } from "../src/relax-ng/simplification/simplified-types";
import { extractElementType } from "../src/relax-ng/extract/element-type";
import { makeTypesForGrammar } from "../src/relax-ng/typescript/make-type";
import { renameRefsPlugin } from "../src/relax-ng/typescript/rename-refs-plugin";

// Make console.log pretty-print by default
const origLog = console.log;
console.log = (...args) => {
    origLog(...args.map((x) => util.inspect(x, false, 10, true)));
};

describe("relax-ng-simplify", () => {
    it("rule1", async () => {
        const processor = unifiedXml().use(rule1);
        const source = `<grammar>
    <element name="foo">
        <a:documentation>Important prop!</a:documentation>
        <text />
    </element>
</grammar>`;
        const processed = String(processor.processSync(source));

        const formatted = Prettier.format(processed, { parser: "html" });
        expect(formatted).toMatchSnapshot();
    });

    it("rule2", async () => {
        const processor = unifiedXml().use(rule1).use(rule2);
        const source = `<grammar>
    <element name="foo">
        <a:documentation>Important prop!</a:documentation>
        <text />
    </element>
</grammar>`;
        const processed = String(processor.processSync(source));

        const formatted = Prettier.format(processed, { parser: "html" });
        expect(formatted).toMatchSnapshot();
    });

    it("rule4", async () => {
        const processor = unifiedXml().use(rule1).use(rule2).use(rule4);
        const source = `<grammar>
    <element name="foo">
        <attribute name="attr"><choice><value>7</value><value type="integer">9</value></choice></attribute>
        <a:documentation>Important prop!</a:documentation>
        <text />
    </element>
</grammar>`;
        const processed = String(processor.processSync(source));

        const formatted = Prettier.format(processed, { parser: "html" });
        expect(formatted).toMatchSnapshot();
    });

    it("rule4", async () => {
        const processor = unifiedXml()
            .use(rule1)
            .use(rule2)
            .use(rule4)
            .use(rule8);
        const source = `<grammar>
    <element name="foo">
        <attribute name="attr"><choice><value>7</value><value type="integer">9</value></choice></attribute>
        <a:documentation>Important prop!</a:documentation>
        <text />
    </element>
</grammar>`;
        const processed = String(processor.processSync(source));

        const formatted = Prettier.format(processed, { parser: "html" });
        expect(formatted).toMatchSnapshot();
    });

    it("rule4", async () => {
        const processor = unifiedXml()
            .use(rule1)
            .use(rule2)
            .use(rule8)
            .use(rule12);
        const source = `
<element name="ol">
  <optional>
    <attribute name="cols"/>
  </optional>
  <optional>
    <attribute name="marker"/>
  </optional>
  <oneOrMore>
      <ref name="li"/>
  </oneOrMore>
</element>
`;
        const processed = String(processor.processSync(source));

        const formatted = Prettier.format(processed, { parser: "html" });
        expect(formatted).toMatchSnapshot();
    });

    it("doesn't lose children", () => {
        const processor = unifiedXml()
            .use(doSimplificationPlugin)
            //.use(renameRefsPlugin);
        const source = `
<grammar>
    <start>
        <ref name="Foo" />
    </start>
    <define name="Foo">
        <element name="author">
          <element name="personname">
              <text/>
          </element>
          <optional>
            <element name="email">
              <text/>
            </element>
          </optional>
        </element>
        <element name="author">
              <text/>
        </element>
    </define>
</grammar>
`;
        const inputXml = processor.parse(source);
        let outputXml = processor.runSync(inputXml);
        outputXml = unifiedXml().use(renameRefsPlugin).runSync(outputXml)
        const processed = processor.stringify(outputXml) as unknown as string;

        const formatted = Prettier.format(processed, { parser: "html" });
        origLog(formatted);

        //console.log(makeTypesForGrammar(outputXml.children[0]));
    });
});
