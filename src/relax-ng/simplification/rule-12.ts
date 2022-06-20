import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { Root, Element } from "xast";
import { x } from "xastscript";
import { isElement } from "../../xast-utils";
import { ensureChildrenArePairs } from "./utils";

/**
 * Simplification steps from https://relaxng.org/spec-20011203.html
 */

/**
 * A define, oneOrMore, zeroOrMore, optional, list or mixed element is transformed so that it has
 * exactly one child element. If it has more than one child element, then its child elements are
 * wrapped in a group element. Similarly, an element element is transformed so that it has exactly
 * two child elements, the first being a name class and the second being a pattern. If it has more
 * than two child elements, then the child elements other than the first are wrapped in a group element.
 *
 * A except element is transformed so that it has exactly one child element. If it has more than one child
 *  element, then its child elements are wrapped in a choice element.
 *
 * If an attribute element has only one child element (a name class), then a text element is added.
 *
 * A choice, group or interleave element is transformed so that it has exactly two child elements.
 * If it has one child element, then it is replaced by its child element. If it has more than two
 * child elements, then the first two child elements are combined into a new element with the same
 * name as the parent element and with the first two child elements as its children.
 */
export const rule12: Plugin<void[], Root, Root> = function () {
    function moreThanOneChildWarnIfZero(node: Element): boolean {
        if (node.children.length === 0) {
            console.warn(
                `Expected exactly one child of <${node.name}> but found none`
            );
            return false;
        }
        if (node.children.length === 1) {
            return false;
        }
        return true;
    }

    return (tree) => {
        visit(tree, isElement, (node) => {
            switch (node.name) {
                case "define":
                case "oneOrMore":
                case "zeroOrMore":
                case "optional":
                case "list":
                case "mixed":
                    if (moreThanOneChildWarnIfZero(node)) {
                        node.children = [x("group", node.children)];
                    }
                    return;
                case "except":
                    if (moreThanOneChildWarnIfZero(node)) {
                        node.children = [x("choice", node.children)];
                    }
                    return;
                case "attribute":
                    if (node.children.filter(isElement).length === 1) {
                        node.children.push(x("text"));
                    }
                    return;
                case "choice":
                case "group":
                case "interleave":
                    const wrapResult = ensureChildrenArePairs(node, node.name);
                    if (wrapResult.shouldUnwrap) {
                        // There is only one child. Its contents should replace itself
                        console.warn("not implemented yet");
                    }
                case "element":
                    if (node.children.length < 2) {
                        console.warn(
                            `Expected <element ...> to have at least 2 children but found ${node.children.length}`
                        );
                        return;
                    }
                    if (node.children.length === 2) {
                        return;
                    }
                    const remainingChildren = x(
                        "group",
                        node.children.slice(1)
                    );
                    ensureChildrenArePairs(
                        remainingChildren,
                        remainingChildren.name
                    );
                    node.children = [node.children[0], remainingChildren];
            }
        });
    };
};
