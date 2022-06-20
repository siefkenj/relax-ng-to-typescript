import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { Root, Element } from "xast";
import { elmMatcher, TypeGuard } from "../../xast-utils";

/**
 * Simplification steps from https://relaxng.org/spec-20011203.html
 */

/**
 * Each div element is replaced by its children.
 */
export const rule11: Plugin<void[], Root, Root> = function () {
    return (tree) => {
        visit(
            tree,
            elmMatcher("div") as TypeGuard<Element>,
            (node, file, parent) => {
                if (!parent) {
                    return;
                }
                parent.children = parent.children.flatMap((n) => {
                    if (n === node) {
                        return node.children;
                    }
                    return n;
                });
            }
        );
    };
};
