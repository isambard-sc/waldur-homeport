'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var fs = require('fs');
var path = require('path');
var ts = require('typescript');
// Function to extract string literals from binary expressions
function extractStringFromBinaryExpression(node) {
  var left = node.left;
  var right = node.right;
  var leftString = null;
  var rightString = null;
  if (ts.isStringLiteral(left)) {
    leftString = left.text;
  } else if (ts.isBinaryExpression(left)) {
    leftString = extractStringFromBinaryExpression(left);
  }
  if (ts.isStringLiteral(right)) {
    rightString = right.text;
  } else if (ts.isBinaryExpression(right)) {
    rightString = extractStringFromBinaryExpression(right);
  }
  if (leftString !== null && rightString !== null) {
    return leftString + rightString;
  } else if (leftString !== null) {
    return leftString;
  } else if (rightString !== null) {
    return rightString;
  }
  return null;
}
// Function to extract string literals from the first argument of the translate function
function extractStringLiteralFromTranslate(node, literals) {
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'translate' &&
    node.arguments.length > 0
  ) {
    var firstArg = node.arguments[0];
    var literal = null;
    if (ts.isStringLiteral(firstArg)) {
      literal = firstArg.text;
    } else if (ts.isBinaryExpression(firstArg)) {
      literal = extractStringFromBinaryExpression(firstArg);
    }
    if (literal !== null) {
      literals.add(literal);
    }
  }
  ts.forEachChild(node, function (childNode) {
    return extractStringLiteralFromTranslate(childNode, literals);
  });
}
// Function to process a single file
function processFile(filePath, literals) {
  var sourceCode = fs.readFileSync(filePath, 'utf8');
  var sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );
  extractStringLiteralFromTranslate(sourceFile, literals);
}
// Function to recursively find all .ts and .tsx files in the specified directory
function getAllTSFiles(dirPath, arrayOfFiles) {
  if (arrayOfFiles === void 0) {
    arrayOfFiles = [];
  }
  var files = fs.readdirSync(dirPath);
  files.forEach(function (file) {
    var fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllTSFiles(fullPath, arrayOfFiles);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}
// Main function
function main(dirPath, outputFilePath) {
  var tsFiles = getAllTSFiles(dirPath);
  var literals = new Set();
  tsFiles.forEach(function (filePath) {
    processFile(filePath, literals);
  });
  // Convert the Set to an object with empty string values and sort its keys
  var sortedLiterals = Object.fromEntries(
    Array.from(literals)
      .sort()
      .map(function (literal) {
        return [literal, ''];
      }),
  );
  // Save the extracted literals to a JSON file
  fs.writeFileSync(
    outputFilePath,
    JSON.stringify(sortedLiterals, null, 2),
    'utf8',
  );
}
// Specify the directory to be processed (e.g., current directory)
var directoryPath = path.join(__dirname, 'src');
// Specify the output JSON file path
var outputFilePath = path.join(__dirname, 'template.json');
// Run the main function
main(directoryPath, outputFilePath);
