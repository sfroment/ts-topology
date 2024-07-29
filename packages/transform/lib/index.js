import { Transform } from "assemblyscript/dist/transform.js";
import { isStdlib, toString } from "visitor-as/dist/utils.js";
import { BaseVisitor } from "visitor-as/dist/index.js";
class AbiTransform extends BaseVisitor {
    visitMethodDeclaration(node) {
        console.log("MethodDeclaration", node.name.text, toString(node));
        const parameters = node.signature.parameters;
        for (const parameter of parameters) {
            console.log("Parameter", parameter.name.text);
            console.log("Parameter", parameter.parameterKind.toString());
        }
    }
    visitClassDeclaration(node) {
        console.log("ClassDeclaration", node.name.text);
    }
    visitFunctionExpression(node) {
        console.log("FunctionExpression", node.declaration);
    }
}
export default class Transformer extends Transform {
    // Trigger the transform after parse.
    afterParse(parser) {
        // Create new transform
        //console.log("Parsing...", parser.sources);
        // Create new transform
        const transformer = new AbiTransform();
        // Sort the sources so that user scripts are visited last
        const sources = parser.sources
            .filter((source) => !isStdlib(source))
            .sort((_a, _b) => {
            const a = _a.internalPath;
            const b = _b.internalPath;
            if (a[0] === "~" && b[0] !== "~") {
                return -1;
            }
            else if (a[0] !== "~" && b[0] === "~") {
                return 1;
            }
            else {
                return 0;
            }
        });
        // Loop over every source
        for (const source of sources) {
            // Ignore all lib and std. Visit everything else.
            if (!isStdlib(source)) {
                transformer.visit(source);
            }
        }
        //// Check that every parent and child class is hooked up correctly
        //const schemas = transformer.schemasList;
        //for (const schema of schemas) {
        //  if (schema.parent) {
        //    const parent = schemas.find((v) => v.name === schema.parent?.name);
        //    if (!parent)
        //      throw new Error(
        //        `Class ${schema.name} extends its parent class ${schema.parent}, but ${schema.parent} does not include a @json or @serializable decorator! Add the decorator and rebuild.`
        //      );
        //  }
        //}
    }
}
