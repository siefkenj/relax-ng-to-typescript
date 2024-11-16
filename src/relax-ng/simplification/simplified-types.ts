/**
 * RELAX-NG types for the schema after simplification. Ported from https://relaxng.org/spec-20011203.html#element-pattern
 */

import { Element as XMLElement, Text as XMLText, Root as XMLRoot } from "xast";

export interface NGSimpRoot extends Omit<XMLRoot, "children"> {
    children: [NGSimpGrammar];
}

export interface Element<Name extends string> extends XMLElement {
    name: Name;
    attributes: never;
    children: never[];
}

export interface ElementWithChildren<
    Name extends string,
    Children extends XMLElement["children"]
> extends XMLElement {
    name: Name;
    attributes: never;
    children: Children;
}

export interface NGSimpGrammar extends Omit<XMLElement, "attributes"> {
    name: "grammar";
    //attributes?: never;
    children: [NGSimpStart, ...NGSimpDefine[]];
}

export interface NGSimpStart extends XMLElement {
    name: "start";
    attributes: never;
    children: [NGSimpTop];
}

export interface NGSimpDefine extends XMLElement {
    name: "define";
    attributes: { name: string };
    children: [NGSimpElement];
}
export interface NGSimpRef extends XMLElement {
    name: "ref";
    attributes: { name: string };
    children: never[];
}

export type NGSimpElement = ElementWithChildren<
    "element",
    [NGSimpNameClass, NGSimpTop]
>;

export type NGSimpNotAllowed = Element<"notAllowed">;
export type NGSimpEmpty = Element<"empty">;
export type NGSimpText = Element<"text">;

export type NGSimpTop = NGSimpNotAllowed | NGSimpPattern;
export type NGSimpPattern = NGSimpEmpty | NGSimpNonEmptyPattern;

export type NGSimpNonEmptyPattern =
    | NGSimpText
    | NGSimpData
    | NGSimpValue
    | ElementWithChildren<"list", [NGSimpPattern]>
    | ElementWithChildren<"attribute", [NGSimpNameClass, NGSimpPattern]>
    | NGSimpRef
    | ElementWithChildren<"oneOrMore", [NGSimpNonEmptyPattern]>
    | ElementWithChildren<"choice", [NGSimpPattern, NGSimpNonEmptyPattern]>
    | ElementWithChildren<
          "group",
          [NGSimpNonEmptyPattern, NGSimpNonEmptyPattern]
      >
    | ElementWithChildren<
          "interleave",
          [NGSimpNonEmptyPattern, NGSimpNonEmptyPattern]
      >;

export interface NGSimpData extends XMLElement {
    name: "data";
    attributes: { type: string };
    children: (NGSimpParam | NGSimpExceptPattern)[];
}

export interface NGSimpValue extends XMLElement {
    name: "value";
    attributes: { type: string };
    children: XMLText[];
}

export interface NGSimpParam extends XMLElement {
    name: "param";
    attributes: { name: string };
    children: XMLText[];
}
export interface NGSimpName extends XMLElement {
    name: "name";
    attributes: never;
    children: XMLText[];
}

export interface NGSimpExceptPattern extends XMLElement {
    name: "except";
    attributes: never;
    children: [NGSimpPattern];
}

export interface NGSimpExceptNameClass extends XMLElement {
    name: "except";
    attributes: never;
    children: NGSimpNameClass[];
}
export type NGSimpNameClass =
    | ElementWithChildren<"anyName", NGSimpExceptNameClass[]>
    | ElementWithChildren<"nsName", NGSimpExceptNameClass[]>
    | NGSimpName
    | ElementWithChildren<"choice", [NGSimpNameClass, NGSimpNameClass]>;
