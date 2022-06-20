import { Plugin } from "unified";
import { EXIT, visit } from "unist-util-visit";
import { Root, Element } from "xast";
import { x } from "xastscript";
import { elmMatcher, isElement, TypeGuard } from "../../xast-utils";
import { getNormalizedElementName, replaceIn } from "./utils";
import Slugger from "github-slugger";

type DefineElement = Element & { name: "define"; attributes: { name: string } };

/**
 * In this rule, the grammar is transformed so that every element element is
 * the child of a define element, and the child of every define element is an element element.
 */
export const rule19: Plugin<void[], Root, Root> = function () {
    const isElementElement = elmMatcher("element");
    const isDefine = elmMatcher("define");

    return (tree) => {
        const slug = new Slugger();
        const defines: Record<string, DefineElement> = {};
        // Find all existing defines
        visit(tree, elmMatcher("define") as TypeGuard<Element>, (node) => {
            defines[node.attributes?.name || ""] = node as DefineElement;
        });
        // Populate the slugger with existing defines
        Object.keys(defines).forEach((name) => slug.slug(name, true));

        //  for each element element that is not the child of a define element, add a define element
        // to the grammar element, and replace the element element by a ref element referring to
        // the added define element. The value of the name attribute of the added define element must
        // be different from value of the name attribute of all other define elements. The child of
        // the added define element is the element element.
        const newDefines: DefineElement[] = [];
        visit(
            tree,
            elmMatcher("element") as TypeGuard<Element>,
            (node, file, parent) => {
                if (!parent || parent.type !== "element") {
                    return;
                }
                if (!(parent.name === "define")) {
                    const name = getNormalizedElementName(node);
                    const refName = slug.slug(name, true);
                    const newDefine = x("define", { name: refName }, [
                        node,
                    ]) as DefineElement;
                    newDefines.push(newDefine);
                    const replacement = x("ref", { name: refName });
                    replaceIn(parent, node, replacement);
                }
            }
        );

        visit(tree, elmMatcher("grammar") as TypeGuard<Element>, (grammar) => {
            grammar.children.push(...newDefines);
            return EXIT;
        });

        // Define a ref element to be expandable if it refers to a define element whose child is not an element
        // element. For each ref element that is expandable and is a descendant of a start element or an element
        // element, expand it by replacing the ref element by the child of the define element to which it refers
        // and then recursively expanding any expandable ref elements in this replacement. This must not result in
        // a loop. In other words expanding the replacement of a ref element having a name with value n must
        // not require the expansion of ref element also having a name with value n. Finally, remove any define
        // element whose child is not an element element.

        // We need to find all expandable refs. Since every new define we created is not expandable,
        // we can limit our search to the original defines.
        const expandableDefs = { ...defines };
        for (const refName in expandableDefs) {
            const define = defines[refName];
            if (isElementElement(define.children[0])) {
                delete expandableDefs[refName];
            }
        }
        const haveVisited: WeakSet<Element> = new WeakSet();
        visit(
            tree,
            elmMatcher("ref") as TypeGuard<Element>,
            (node, file, parent) => {
                if (!isElement(parent)) {
                    return;
                }
                const refName = node.attributes?.name || "";
                if (!expandableDefs[refName]) {
                    return;
                }
                // If we're here, there is a def that needs expanding
                if (haveVisited.has(node)) {
                    throw new Error(
                        `Detected infinite loop when trying to expand ref name="${refName}"`
                    );
                }
                haveVisited.add(node);

                parent.children = parent.children.flatMap((n) =>
                    n === node ? expandableDefs[refName].children : n
                );
            }
        );

        // Now clean up: remove all the expandable definitions
        visit(tree, elmMatcher("grammar") as TypeGuard<Element>, (grammar) => {
            grammar.children = grammar.children.filter((node) => {
                if (isDefine(node)) {
                    const refName = node.attributes?.name || "";
                    if (expandableDefs[refName]) {
                        return false;
                    }
                }
                return true;
            });
            return EXIT;
        });
    };
};
