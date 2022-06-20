import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { Root, Element } from "xast";
import { x } from "xastscript";
import { elmMatcher, TypeGuard } from "../../xast-utils";

/**
 * Simplification steps from https://relaxng.org/spec-20011203.html
 */

/**
 * An optional element is transformed into a choice with empty:
 */
export const rule15: Plugin<void[], Root, Root> = function () {
    return (tree) => {
        visit(
            tree,
            elmMatcher("zeroOrMore") as TypeGuard<Element>,
            (node, file, parent) => {
                if (!parent) {
                    return;
                }
                parent.children = parent.children.flatMap((n) => {
                    if (n === node) {
                        return x("choice", [
                            x("oneOrMore", node.children),
                            x("empty"),
                        ]);
                    }
                    return n;
                });
            }
        );
    };
};
