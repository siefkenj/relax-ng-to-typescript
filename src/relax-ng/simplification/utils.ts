import { Element, Root } from "xast";
import { toString } from "xast-util-to-string";
import { x } from "xastscript";
import { isElement, expected } from "../../xast-utils";

type XastChild = Root["children"][number];

/**
 * If there are multiple children of a `< ``name`` >` element, recursively
 * wrap them.
 */
export function ensureChildrenArePairs(
    node: Element,
    name: string
): { shouldUnwrap: boolean } {
    expected(node, name);
    const children = node.children.filter(isElement);
    if (children.length <= 1) {
        return { shouldUnwrap: true };
    }
    if (children.length === 2) {
        // The perfect situation!
        return { shouldUnwrap: false };
    }
    // If we're here we have more than two children.
    const lastChild = children.pop() as Element;
    const attemptedWrap = x(name, children);
    const wrapResult = ensureChildrenArePairs(attemptedWrap, name);
    if (wrapResult.shouldUnwrap) {
        console.warn(
            "SOMETHING WENT WRONG: the `ensureChildrenArePairs` function returned the wrong result when acting recursively"
        );
    }
    node.children = [attemptedWrap, lastChild];

    return { shouldUnwrap: false };
}

/**
 * If `node` is an element type and has been normalized (i.e., it's name was moved to be its
 * first child), then retrieve its name.
 *
 * @export
 * @param {Element} node
 */
export function getNormalizedElementName(node: Element) {
    expected(node, "element");
    const firstChild = node.children[0];
    expected(firstChild, "name");

    return toString(firstChild);
}

/**
 * Replace every occurrence of `node` in `parent.children` with `replacement`
 */
export function replaceIn(
    parent: Element | Root | null | undefined,
    node: XastChild,
    replacement: XastChild
): void {
    if (!parent) {
        return;
    }
    parent.children = parent.children.map((n) =>
        n === node ? replacement : n
    );
}
