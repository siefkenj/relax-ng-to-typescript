import { Plugin } from "unified";
import type { Root } from "xast";
import { rule1 } from "./rule-01";
import { rule2 } from "./rule-02";
import { rule3 } from "./rule-03";
import { rule4 } from "./rule-04";
import { rule5 } from "./rule-05";
import { rule6 } from "./rule-06";
import { rule7 } from "./rule-07";
import { rule8 } from "./rule-08";
import { rule9 } from "./rule-09";
import { rule10 } from "./rule-10";
import { rule11 } from "./rule-11";
import { rule12 } from "./rule-12";
import { rule13 } from "./rule-13";
import { rule14 } from "./rule-14";
import { rule15 } from "./rule-15";
import { rule16 } from "./rule-16";
import { rule17 } from "./rule-17";
import { rule18 } from "./rule-18";
import { rule19 } from "./rule-19";
import { rule20 } from "./rule-20";
import { rule21 } from "./rule-21";
import { NGSimpRoot } from "./simplified-types";

/**
 * Apply simplification rules defined in https://relaxng.org/spec-20011203.html
 *
 * Note: Rules related to XML namespaces are skipped.
 */
export const doSimplificationPlugin: Plugin<never[], Root, NGSimpRoot> =
    function () {
        this.use(rule1)
            .use(rule2)
            .use(rule3)
            .use(rule4)
            .use(rule5)
            .use(rule6)
            .use(rule7)
            .use(rule8)
            .use(rule9)
            .use(rule10)
            .use(rule11)
            .use(rule12)
            .use(rule13)
            .use(rule14)
            .use(rule15)
            .use(rule16)
            .use(rule17)
            .use(rule18)
            .use(rule19)
            .use(rule20)
            .use(rule21);
    };
