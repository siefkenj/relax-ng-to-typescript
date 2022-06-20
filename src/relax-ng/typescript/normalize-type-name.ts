// From https://stackoverflow.com/questions/54651201/how-do-i-covert-kebab-case-into-pascalcase
function toCamelCase(text: string) {
    return text.replace(/-\w/g, clearAndUpper);
}

// From https://stackoverflow.com/questions/54651201/how-do-i-covert-kebab-case-into-pascalcase
function toPascalCase(text: string) {
    return text.replace(/(^\w|-\w)/g, clearAndUpper);
}

// From https://stackoverflow.com/questions/54651201/how-do-i-covert-kebab-case-into-pascalcase
function clearAndUpper(text: string) {
    return text.replace(/-/, "").toUpperCase();
}

/**
 * Make a valid typescript type name out of `name` that is in PascalCase.
 */
export function normalizeTypeName(name: string, prefix = ""): string {
    let ret = toPascalCase(name);
    ret = ret.replace(/[^a-zA-Z0-9_]/g, "");
    if (ret.charAt(0).match(/[0-9]/)) {
        ret = "_" + ret;
    }

    return prefix + ret;
}
