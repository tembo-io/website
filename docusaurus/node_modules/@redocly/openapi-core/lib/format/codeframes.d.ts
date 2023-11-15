import * as yamlAst from 'yaml-ast-parser';
import { LineColLocationObject, LocationObject } from '../walk';
declare type YAMLMapping = yamlAst.YAMLMapping & {
    kind: yamlAst.Kind.MAPPING;
};
declare type YAMLMap = yamlAst.YamlMap & {
    kind: yamlAst.Kind.MAP;
};
declare type YAMLAnchorReference = yamlAst.YAMLAnchorReference & {
    kind: yamlAst.Kind.ANCHOR_REF;
};
declare type YAMLSequence = yamlAst.YAMLSequence & {
    kind: yamlAst.Kind.SEQ;
};
declare type YAMLScalar = yamlAst.YAMLScalar & {
    kind: yamlAst.Kind.SCALAR;
};
declare type YAMLNode = YAMLMapping | YAMLMap | YAMLAnchorReference | YAMLSequence | YAMLScalar;
export declare function getCodeframe(location: LineColLocationObject, color: boolean): string;
export declare function getLineColLocation(location: LocationObject): LineColLocationObject;
export declare function getAstNodeByPointer(root: YAMLNode, pointer: string, reportOnKey: boolean): yamlAst.YAMLScalar | YAMLMapping | YAMLMap | YAMLAnchorReference | YAMLSequence | undefined;
export {};
