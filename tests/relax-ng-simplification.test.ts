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
});
