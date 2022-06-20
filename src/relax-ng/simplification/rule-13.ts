import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { Root, Element } from "xast";
import { x } from "xastscript";
import { elmMatcher, TypeGuard } from "../../xast-utils";

/**
 * A mixed element is transformed into an interleaving with a text element.
 */
export const rule13: Plugin<void[], Root, Root> = function () {
    return (tree) => {
        visit(
            tree,
            elmMatcher("mixed") as TypeGuard<Element>,
            (node, file, parent) => {
                if (!parent) {
                    return;
                }
                parent.children = parent.children.flatMap((n) => {
                    if (n === node) {
                        return x("interleave", [...node.children, x("text")]);
                    }
                    return n;
                });
            }
        );
    };
};
