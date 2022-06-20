import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { Root, Element } from "xast";
import { x } from "xastscript";
import { elmMatcher, isElement, TypeGuard } from "../../xast-utils";
import { ensureChildrenArePairs } from "./utils";

/**
 * For each grammar element, all define elements with the same name are combined together.
 * For any name, there must not be more than one define element with that name that does not
 * have a combine attribute. For any name, if there is a define element with that name that
 * has a combine attribute with the value choice, then there must not also be a define element
 * with that name that has a combine attribute with the value interleave. Thus, for any name,
 *  if there is more than one define element with that name, then there is a unique value for
 * the combine attribute for that name. After determining this unique value, the combine
 * attributes are removed.
 */
export const rule17: Plugin<void[], Root, Root> = function () {
    const isDefine = elmMatcher("define");
    return (tree) => {
        visit(tree, elmMatcher("grammar") as TypeGuard<Element>, (grammar) => {
            // All define nodes are on the root. Remove them for now. We'll be putting them back.
            const defineCache: Record<string, Element[]> = {};
            grammar.children = grammar.children.filter((node) => {
                if (!isElement(node) || !isDefine(node)) {
                    return true;
                }
                const refName = node.attributes?.name || "";
                defineCache[refName] = defineCache[refName] || [];
                defineCache[refName].push(node);
            });

            // Verify there is no mixing of `combine` formats
            for (const defines of Object.values(defineCache)) {
                const methods = new Set(
                    defines
                        .map((elm) => elm.attributes?.combine)
                        .filter((m) => m)
                );
                if (methods.size > 1) {
                    console.warn(
                        `Found more than one "combine" method on <define name="${defines[0].attributes?.name}">`
                    );
                }
                if (defines.length > 1) {
                    if (methods.has("choice")) {
                        const allChildren = defines.flatMap((n) => n.children);
                        const choice = x("choice", allChildren);
                        const ret = ensureChildrenArePairs(choice, "choice");
                        if (ret.shouldUnwrap) {
                            console.warn(
                                "SOMETHING WENT WRONG: at this stage, unwrapping should never be needed"
                            );
                        }

                        const newDefine = x(
                            "define",
                            { name: defines[0].attributes?.name },
                            [choice]
                        );
                        defines.length = 0;
                        defines.push(newDefine);
                    } else if (methods.has("interleave")) {
                        console.warn(
                            `"combine"="interleave" is not implemented`
                        );
                    } else {
                        console.warn(
                            `Found multiple <define name="${defines[0].attributes?.name}"> but no "combine" attribute specified`
                        );
                    }
                }
                grammar.children.push(defines[0]);
            }
        });
    };
};
