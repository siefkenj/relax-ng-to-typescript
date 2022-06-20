import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { Root } from "xast";
import { x } from "xastscript";
import { elmMatcher, isElement } from "../../xast-utils";
import { replaceIn } from "./utils";

/**
 * In this rule, the grammar is transformed so that an empty element does not occur as
 * a child of a group, interleave, or oneOrMore element or as the second child of a
 * choice element. A group, interleave or choice element that has two empty child elements
 * as transformed into an empty element. A group or interleave element that has one empty
 * child element is transformed into its other child element. A choice element whose second
 * child element is an empty element is transformed by interchanging its two child elements.
 * A oneOrMore element that has an empty child element is transformed into an empty element.
 * The preceding transformations are applied repeatedly until none of them is applicable any more.
 */
export const rule21: Plugin<void[], Root, Root> = function () {
    const isEmptyElement = elmMatcher("empty");
    return (tree) => {
        let wasChange = true;
        let i = 0;
        while (wasChange) {
            i++;
            if (i > 1000) {
                throw new Error(
                    `Reductions have not stabilized after ${i} iterations. Aborting`
                );
            }
            wasChange = false;

            visit(tree, isElement, (node, file, parent) => {
                // A group, interleave or choice element that has two empty child elements is transformed into an empty element
                switch (node.name) {
                    case "group":
                    case "interleave":
                    case "choice":
                        if (
                            node.children.length >= 2 &&
                            node.children.every((n) => isEmptyElement(n))
                        ) {
                            replaceIn(parent, node, x("empty"));
                            wasChange = true;
                        }
                }
                // A group or interleave element that has one empty child element is transformed into its other child element
                switch (node.name) {
                    case "group":
                    case "interleave":
                        if (
                            node.children.filter((n) => isEmptyElement(n))
                                .length === 1
                        ) {
                            const replacement = node.children.find(
                                (n) => !isEmptyElement(n)
                            );
                            if (replacement) {
                                replaceIn(parent, node, replacement);
                                wasChange = true;
                            } else {
                                console.warn(
                                    "SOMETHING WENT WRONG: at this stage, every group/interleave should have exactly two children"
                                );
                            }
                        }
                }
                // A choice element whose second child element is an empty element is transformed by interchanging its two child elements
                if (node.name === "choice") {
                    if (isEmptyElement(node.children[1])) {
                        node.children = [node.children[1], node.children[0]];
                        wasChange = true;
                    }
                }
                // A oneOrMore element that has an empty child element is transformed into an empty element.
                if (node.name === "oneOrMore") {
                    if (node.children.some((n) => isEmptyElement(n))) {
                        replaceIn(parent, node, x("empty"));
                        wasChange = true;
                    }
                }
            });
        }
    };
};
