/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/jsonc-parser/lib/esm/impl/edit.js":
/*!********************************************************!*\
  !*** ./node_modules/jsonc-parser/lib/esm/impl/edit.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "removeProperty": () => (/* binding */ removeProperty),
/* harmony export */   "setProperty": () => (/* binding */ setProperty),
/* harmony export */   "applyEdit": () => (/* binding */ applyEdit),
/* harmony export */   "isWS": () => (/* binding */ isWS)
/* harmony export */ });
/* harmony import */ var _format__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./format */ "./node_modules/jsonc-parser/lib/esm/impl/format.js");
/* harmony import */ var _parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parser */ "./node_modules/jsonc-parser/lib/esm/impl/parser.js");
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/



function removeProperty(text, path, options) {
    return setProperty(text, path, void 0, options);
}
function setProperty(text, originalPath, value, options) {
    var _a;
    var path = originalPath.slice();
    var errors = [];
    var root = (0,_parser__WEBPACK_IMPORTED_MODULE_1__.parseTree)(text, errors);
    var parent = void 0;
    var lastSegment = void 0;
    while (path.length > 0) {
        lastSegment = path.pop();
        parent = (0,_parser__WEBPACK_IMPORTED_MODULE_1__.findNodeAtLocation)(root, path);
        if (parent === void 0 && value !== void 0) {
            if (typeof lastSegment === 'string') {
                value = (_a = {}, _a[lastSegment] = value, _a);
            }
            else {
                value = [value];
            }
        }
        else {
            break;
        }
    }
    if (!parent) {
        // empty document
        if (value === void 0) { // delete
            throw new Error('Can not delete in empty document');
        }
        return withFormatting(text, { offset: root ? root.offset : 0, length: root ? root.length : 0, content: JSON.stringify(value) }, options);
    }
    else if (parent.type === 'object' && typeof lastSegment === 'string' && Array.isArray(parent.children)) {
        var existing = (0,_parser__WEBPACK_IMPORTED_MODULE_1__.findNodeAtLocation)(parent, [lastSegment]);
        if (existing !== void 0) {
            if (value === void 0) { // delete
                if (!existing.parent) {
                    throw new Error('Malformed AST');
                }
                var propertyIndex = parent.children.indexOf(existing.parent);
                var removeBegin = void 0;
                var removeEnd = existing.parent.offset + existing.parent.length;
                if (propertyIndex > 0) {
                    // remove the comma of the previous node
                    var previous = parent.children[propertyIndex - 1];
                    removeBegin = previous.offset + previous.length;
                }
                else {
                    removeBegin = parent.offset + 1;
                    if (parent.children.length > 1) {
                        // remove the comma of the next node
                        var next = parent.children[1];
                        removeEnd = next.offset;
                    }
                }
                return withFormatting(text, { offset: removeBegin, length: removeEnd - removeBegin, content: '' }, options);
            }
            else {
                // set value of existing property
                return withFormatting(text, { offset: existing.offset, length: existing.length, content: JSON.stringify(value) }, options);
            }
        }
        else {
            if (value === void 0) { // delete
                return []; // property does not exist, nothing to do
            }
            var newProperty = JSON.stringify(lastSegment) + ": " + JSON.stringify(value);
            var index = options.getInsertionIndex ? options.getInsertionIndex(parent.children.map(function (p) { return p.children[0].value; })) : parent.children.length;
            var edit = void 0;
            if (index > 0) {
                var previous = parent.children[index - 1];
                edit = { offset: previous.offset + previous.length, length: 0, content: ',' + newProperty };
            }
            else if (parent.children.length === 0) {
                edit = { offset: parent.offset + 1, length: 0, content: newProperty };
            }
            else {
                edit = { offset: parent.offset + 1, length: 0, content: newProperty + ',' };
            }
            return withFormatting(text, edit, options);
        }
    }
    else if (parent.type === 'array' && typeof lastSegment === 'number' && Array.isArray(parent.children)) {
        var insertIndex = lastSegment;
        if (insertIndex === -1) {
            // Insert
            var newProperty = "" + JSON.stringify(value);
            var edit = void 0;
            if (parent.children.length === 0) {
                edit = { offset: parent.offset + 1, length: 0, content: newProperty };
            }
            else {
                var previous = parent.children[parent.children.length - 1];
                edit = { offset: previous.offset + previous.length, length: 0, content: ',' + newProperty };
            }
            return withFormatting(text, edit, options);
        }
        else if (value === void 0 && parent.children.length >= 0) {
            // Removal
            var removalIndex = lastSegment;
            var toRemove = parent.children[removalIndex];
            var edit = void 0;
            if (parent.children.length === 1) {
                // only item
                edit = { offset: parent.offset + 1, length: parent.length - 2, content: '' };
            }
            else if (parent.children.length - 1 === removalIndex) {
                // last item
                var previous = parent.children[removalIndex - 1];
                var offset = previous.offset + previous.length;
                var parentEndOffset = parent.offset + parent.length;
                edit = { offset: offset, length: parentEndOffset - 2 - offset, content: '' };
            }
            else {
                edit = { offset: toRemove.offset, length: parent.children[removalIndex + 1].offset - toRemove.offset, content: '' };
            }
            return withFormatting(text, edit, options);
        }
        else if (value !== void 0) {
            var edit = void 0;
            var newProperty = "" + JSON.stringify(value);
            if (!options.isArrayInsertion && parent.children.length > lastSegment) {
                var toModify = parent.children[lastSegment];
                edit = { offset: toModify.offset, length: toModify.length, content: newProperty };
            }
            else if (parent.children.length === 0 || lastSegment === 0) {
                edit = { offset: parent.offset + 1, length: 0, content: parent.children.length === 0 ? newProperty : newProperty + ',' };
            }
            else {
                var index = lastSegment > parent.children.length ? parent.children.length : lastSegment;
                var previous = parent.children[index - 1];
                edit = { offset: previous.offset + previous.length, length: 0, content: ',' + newProperty };
            }
            return withFormatting(text, edit, options);
        }
        else {
            throw new Error("Can not " + (value === void 0 ? 'remove' : (options.isArrayInsertion ? 'insert' : 'modify')) + " Array index " + insertIndex + " as length is not sufficient");
        }
    }
    else {
        throw new Error("Can not add " + (typeof lastSegment !== 'number' ? 'index' : 'property') + " to parent of type " + parent.type);
    }
}
function withFormatting(text, edit, options) {
    if (!options.formattingOptions) {
        return [edit];
    }
    // apply the edit
    var newText = applyEdit(text, edit);
    // format the new text
    var begin = edit.offset;
    var end = edit.offset + edit.content.length;
    if (edit.length === 0 || edit.content.length === 0) { // insert or remove
        while (begin > 0 && !(0,_format__WEBPACK_IMPORTED_MODULE_0__.isEOL)(newText, begin - 1)) {
            begin--;
        }
        while (end < newText.length && !(0,_format__WEBPACK_IMPORTED_MODULE_0__.isEOL)(newText, end)) {
            end++;
        }
    }
    var edits = (0,_format__WEBPACK_IMPORTED_MODULE_0__.format)(newText, { offset: begin, length: end - begin }, options.formattingOptions);
    // apply the formatting edits and track the begin and end offsets of the changes
    for (var i = edits.length - 1; i >= 0; i--) {
        var edit_1 = edits[i];
        newText = applyEdit(newText, edit_1);
        begin = Math.min(begin, edit_1.offset);
        end = Math.max(end, edit_1.offset + edit_1.length);
        end += edit_1.content.length - edit_1.length;
    }
    // create a single edit with all changes
    var editLength = text.length - (newText.length - end) - begin;
    return [{ offset: begin, length: editLength, content: newText.substring(begin, end) }];
}
function applyEdit(text, edit) {
    return text.substring(0, edit.offset) + edit.content + text.substring(edit.offset + edit.length);
}
function isWS(text, offset) {
    return '\r\n \t'.indexOf(text.charAt(offset)) !== -1;
}


/***/ }),

/***/ "./node_modules/jsonc-parser/lib/esm/impl/format.js":
/*!**********************************************************!*\
  !*** ./node_modules/jsonc-parser/lib/esm/impl/format.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "format": () => (/* binding */ format),
/* harmony export */   "isEOL": () => (/* binding */ isEOL)
/* harmony export */ });
/* harmony import */ var _scanner__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./scanner */ "./node_modules/jsonc-parser/lib/esm/impl/scanner.js");
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


function format(documentText, range, options) {
    var initialIndentLevel;
    var formatText;
    var formatTextStart;
    var rangeStart;
    var rangeEnd;
    if (range) {
        rangeStart = range.offset;
        rangeEnd = rangeStart + range.length;
        formatTextStart = rangeStart;
        while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
            formatTextStart--;
        }
        var endOffset = rangeEnd;
        while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
            endOffset++;
        }
        formatText = documentText.substring(formatTextStart, endOffset);
        initialIndentLevel = computeIndentLevel(formatText, options);
    }
    else {
        formatText = documentText;
        initialIndentLevel = 0;
        formatTextStart = 0;
        rangeStart = 0;
        rangeEnd = documentText.length;
    }
    var eol = getEOL(options, documentText);
    var lineBreak = false;
    var indentLevel = 0;
    var indentValue;
    if (options.insertSpaces) {
        indentValue = repeat(' ', options.tabSize || 4);
    }
    else {
        indentValue = '\t';
    }
    var scanner = (0,_scanner__WEBPACK_IMPORTED_MODULE_0__.createScanner)(formatText, false);
    var hasError = false;
    function newLineAndIndent() {
        return eol + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    function scanNext() {
        var token = scanner.scan();
        lineBreak = false;
        while (token === 15 /* Trivia */ || token === 14 /* LineBreakTrivia */) {
            lineBreak = lineBreak || (token === 14 /* LineBreakTrivia */);
            token = scanner.scan();
        }
        hasError = token === 16 /* Unknown */ || scanner.getTokenError() !== 0 /* None */;
        return token;
    }
    var editOperations = [];
    function addEdit(text, startOffset, endOffset) {
        if (!hasError && (!range || (startOffset < rangeEnd && endOffset > rangeStart)) && documentText.substring(startOffset, endOffset) !== text) {
            editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
        }
    }
    var firstToken = scanNext();
    if (firstToken !== 17 /* EOF */) {
        var firstTokenStart = scanner.getTokenOffset() + formatTextStart;
        var initialIndent = repeat(indentValue, initialIndentLevel);
        addEdit(initialIndent, formatTextStart, firstTokenStart);
    }
    while (firstToken !== 17 /* EOF */) {
        var firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
        var secondToken = scanNext();
        var replaceContent = '';
        var needsLineBreak = false;
        while (!lineBreak && (secondToken === 12 /* LineCommentTrivia */ || secondToken === 13 /* BlockCommentTrivia */)) {
            // comments on the same line: keep them on the same line, but ignore them otherwise
            var commentTokenStart = scanner.getTokenOffset() + formatTextStart;
            addEdit(' ', firstTokenEnd, commentTokenStart);
            firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
            needsLineBreak = secondToken === 12 /* LineCommentTrivia */;
            replaceContent = needsLineBreak ? newLineAndIndent() : '';
            secondToken = scanNext();
        }
        if (secondToken === 2 /* CloseBraceToken */) {
            if (firstToken !== 1 /* OpenBraceToken */) {
                indentLevel--;
                replaceContent = newLineAndIndent();
            }
        }
        else if (secondToken === 4 /* CloseBracketToken */) {
            if (firstToken !== 3 /* OpenBracketToken */) {
                indentLevel--;
                replaceContent = newLineAndIndent();
            }
        }
        else {
            switch (firstToken) {
                case 3 /* OpenBracketToken */:
                case 1 /* OpenBraceToken */:
                    indentLevel++;
                    replaceContent = newLineAndIndent();
                    break;
                case 5 /* CommaToken */:
                case 12 /* LineCommentTrivia */:
                    replaceContent = newLineAndIndent();
                    break;
                case 13 /* BlockCommentTrivia */:
                    if (lineBreak) {
                        replaceContent = newLineAndIndent();
                    }
                    else if (!needsLineBreak) {
                        // symbol following comment on the same line: keep on same line, separate with ' '
                        replaceContent = ' ';
                    }
                    break;
                case 6 /* ColonToken */:
                    if (!needsLineBreak) {
                        replaceContent = ' ';
                    }
                    break;
                case 10 /* StringLiteral */:
                    if (secondToken === 6 /* ColonToken */) {
                        if (!needsLineBreak) {
                            replaceContent = '';
                        }
                        break;
                    }
                // fall through
                case 7 /* NullKeyword */:
                case 8 /* TrueKeyword */:
                case 9 /* FalseKeyword */:
                case 11 /* NumericLiteral */:
                case 2 /* CloseBraceToken */:
                case 4 /* CloseBracketToken */:
                    if (secondToken === 12 /* LineCommentTrivia */ || secondToken === 13 /* BlockCommentTrivia */) {
                        if (!needsLineBreak) {
                            replaceContent = ' ';
                        }
                    }
                    else if (secondToken !== 5 /* CommaToken */ && secondToken !== 17 /* EOF */) {
                        hasError = true;
                    }
                    break;
                case 16 /* Unknown */:
                    hasError = true;
                    break;
            }
            if (lineBreak && (secondToken === 12 /* LineCommentTrivia */ || secondToken === 13 /* BlockCommentTrivia */)) {
                replaceContent = newLineAndIndent();
            }
        }
        if (secondToken === 17 /* EOF */) {
            replaceContent = options.insertFinalNewline ? eol : '';
        }
        var secondTokenStart = scanner.getTokenOffset() + formatTextStart;
        addEdit(replaceContent, firstTokenEnd, secondTokenStart);
        firstToken = secondToken;
    }
    return editOperations;
}
function repeat(s, count) {
    var result = '';
    for (var i = 0; i < count; i++) {
        result += s;
    }
    return result;
}
function computeIndentLevel(content, options) {
    var i = 0;
    var nChars = 0;
    var tabSize = options.tabSize || 4;
    while (i < content.length) {
        var ch = content.charAt(i);
        if (ch === ' ') {
            nChars++;
        }
        else if (ch === '\t') {
            nChars += tabSize;
        }
        else {
            break;
        }
        i++;
    }
    return Math.floor(nChars / tabSize);
}
function getEOL(options, text) {
    for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        if (ch === '\r') {
            if (i + 1 < text.length && text.charAt(i + 1) === '\n') {
                return '\r\n';
            }
            return '\r';
        }
        else if (ch === '\n') {
            return '\n';
        }
    }
    return (options && options.eol) || '\n';
}
function isEOL(text, offset) {
    return '\r\n'.indexOf(text.charAt(offset)) !== -1;
}


/***/ }),

/***/ "./node_modules/jsonc-parser/lib/esm/impl/parser.js":
/*!**********************************************************!*\
  !*** ./node_modules/jsonc-parser/lib/esm/impl/parser.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getLocation": () => (/* binding */ getLocation),
/* harmony export */   "parse": () => (/* binding */ parse),
/* harmony export */   "parseTree": () => (/* binding */ parseTree),
/* harmony export */   "findNodeAtLocation": () => (/* binding */ findNodeAtLocation),
/* harmony export */   "getNodePath": () => (/* binding */ getNodePath),
/* harmony export */   "getNodeValue": () => (/* binding */ getNodeValue),
/* harmony export */   "contains": () => (/* binding */ contains),
/* harmony export */   "findNodeAtOffset": () => (/* binding */ findNodeAtOffset),
/* harmony export */   "visit": () => (/* binding */ visit),
/* harmony export */   "stripComments": () => (/* binding */ stripComments),
/* harmony export */   "getNodeType": () => (/* binding */ getNodeType)
/* harmony export */ });
/* harmony import */ var _scanner__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./scanner */ "./node_modules/jsonc-parser/lib/esm/impl/scanner.js");
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


var ParseOptions;
(function (ParseOptions) {
    ParseOptions.DEFAULT = {
        allowTrailingComma: false
    };
})(ParseOptions || (ParseOptions = {}));
/**
 * For a given offset, evaluate the location in the JSON document. Each segment in the location path is either a property name or an array index.
 */
function getLocation(text, position) {
    var segments = []; // strings or numbers
    var earlyReturnException = new Object();
    var previousNode = undefined;
    var previousNodeInst = {
        value: {},
        offset: 0,
        length: 0,
        type: 'object',
        parent: undefined
    };
    var isAtPropertyKey = false;
    function setPreviousNode(value, offset, length, type) {
        previousNodeInst.value = value;
        previousNodeInst.offset = offset;
        previousNodeInst.length = length;
        previousNodeInst.type = type;
        previousNodeInst.colonOffset = undefined;
        previousNode = previousNodeInst;
    }
    try {
        visit(text, {
            onObjectBegin: function (offset, length) {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                isAtPropertyKey = position > offset;
                segments.push(''); // push a placeholder (will be replaced)
            },
            onObjectProperty: function (name, offset, length) {
                if (position < offset) {
                    throw earlyReturnException;
                }
                setPreviousNode(name, offset, length, 'property');
                segments[segments.length - 1] = name;
                if (position <= offset + length) {
                    throw earlyReturnException;
                }
            },
            onObjectEnd: function (offset, length) {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                segments.pop();
            },
            onArrayBegin: function (offset, length) {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                segments.push(0);
            },
            onArrayEnd: function (offset, length) {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                segments.pop();
            },
            onLiteralValue: function (value, offset, length) {
                if (position < offset) {
                    throw earlyReturnException;
                }
                setPreviousNode(value, offset, length, getNodeType(value));
                if (position <= offset + length) {
                    throw earlyReturnException;
                }
            },
            onSeparator: function (sep, offset, length) {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                if (sep === ':' && previousNode && previousNode.type === 'property') {
                    previousNode.colonOffset = offset;
                    isAtPropertyKey = false;
                    previousNode = undefined;
                }
                else if (sep === ',') {
                    var last = segments[segments.length - 1];
                    if (typeof last === 'number') {
                        segments[segments.length - 1] = last + 1;
                    }
                    else {
                        isAtPropertyKey = true;
                        segments[segments.length - 1] = '';
                    }
                    previousNode = undefined;
                }
            }
        });
    }
    catch (e) {
        if (e !== earlyReturnException) {
            throw e;
        }
    }
    return {
        path: segments,
        previousNode: previousNode,
        isAtPropertyKey: isAtPropertyKey,
        matches: function (pattern) {
            var k = 0;
            for (var i = 0; k < pattern.length && i < segments.length; i++) {
                if (pattern[k] === segments[i] || pattern[k] === '*') {
                    k++;
                }
                else if (pattern[k] !== '**') {
                    return false;
                }
            }
            return k === pattern.length;
        }
    };
}
/**
 * Parses the given text and returns the object the JSON content represents. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
 * Therefore always check the errors list to find out if the input was valid.
 */
function parse(text, errors, options) {
    if (errors === void 0) { errors = []; }
    if (options === void 0) { options = ParseOptions.DEFAULT; }
    var currentProperty = null;
    var currentParent = [];
    var previousParents = [];
    function onValue(value) {
        if (Array.isArray(currentParent)) {
            currentParent.push(value);
        }
        else if (currentProperty !== null) {
            currentParent[currentProperty] = value;
        }
    }
    var visitor = {
        onObjectBegin: function () {
            var object = {};
            onValue(object);
            previousParents.push(currentParent);
            currentParent = object;
            currentProperty = null;
        },
        onObjectProperty: function (name) {
            currentProperty = name;
        },
        onObjectEnd: function () {
            currentParent = previousParents.pop();
        },
        onArrayBegin: function () {
            var array = [];
            onValue(array);
            previousParents.push(currentParent);
            currentParent = array;
            currentProperty = null;
        },
        onArrayEnd: function () {
            currentParent = previousParents.pop();
        },
        onLiteralValue: onValue,
        onError: function (error, offset, length) {
            errors.push({ error: error, offset: offset, length: length });
        }
    };
    visit(text, visitor, options);
    return currentParent[0];
}
/**
 * Parses the given text and returns a tree representation the JSON content. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
 */
function parseTree(text, errors, options) {
    if (errors === void 0) { errors = []; }
    if (options === void 0) { options = ParseOptions.DEFAULT; }
    var currentParent = { type: 'array', offset: -1, length: -1, children: [], parent: undefined }; // artificial root
    function ensurePropertyComplete(endOffset) {
        if (currentParent.type === 'property') {
            currentParent.length = endOffset - currentParent.offset;
            currentParent = currentParent.parent;
        }
    }
    function onValue(valueNode) {
        currentParent.children.push(valueNode);
        return valueNode;
    }
    var visitor = {
        onObjectBegin: function (offset) {
            currentParent = onValue({ type: 'object', offset: offset, length: -1, parent: currentParent, children: [] });
        },
        onObjectProperty: function (name, offset, length) {
            currentParent = onValue({ type: 'property', offset: offset, length: -1, parent: currentParent, children: [] });
            currentParent.children.push({ type: 'string', value: name, offset: offset, length: length, parent: currentParent });
        },
        onObjectEnd: function (offset, length) {
            ensurePropertyComplete(offset + length); // in case of a missing value for a property: make sure property is complete
            currentParent.length = offset + length - currentParent.offset;
            currentParent = currentParent.parent;
            ensurePropertyComplete(offset + length);
        },
        onArrayBegin: function (offset, length) {
            currentParent = onValue({ type: 'array', offset: offset, length: -1, parent: currentParent, children: [] });
        },
        onArrayEnd: function (offset, length) {
            currentParent.length = offset + length - currentParent.offset;
            currentParent = currentParent.parent;
            ensurePropertyComplete(offset + length);
        },
        onLiteralValue: function (value, offset, length) {
            onValue({ type: getNodeType(value), offset: offset, length: length, parent: currentParent, value: value });
            ensurePropertyComplete(offset + length);
        },
        onSeparator: function (sep, offset, length) {
            if (currentParent.type === 'property') {
                if (sep === ':') {
                    currentParent.colonOffset = offset;
                }
                else if (sep === ',') {
                    ensurePropertyComplete(offset);
                }
            }
        },
        onError: function (error, offset, length) {
            errors.push({ error: error, offset: offset, length: length });
        }
    };
    visit(text, visitor, options);
    var result = currentParent.children[0];
    if (result) {
        delete result.parent;
    }
    return result;
}
/**
 * Finds the node at the given path in a JSON DOM.
 */
function findNodeAtLocation(root, path) {
    if (!root) {
        return undefined;
    }
    var node = root;
    for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
        var segment = path_1[_i];
        if (typeof segment === 'string') {
            if (node.type !== 'object' || !Array.isArray(node.children)) {
                return undefined;
            }
            var found = false;
            for (var _a = 0, _b = node.children; _a < _b.length; _a++) {
                var propertyNode = _b[_a];
                if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment) {
                    node = propertyNode.children[1];
                    found = true;
                    break;
                }
            }
            if (!found) {
                return undefined;
            }
        }
        else {
            var index = segment;
            if (node.type !== 'array' || index < 0 || !Array.isArray(node.children) || index >= node.children.length) {
                return undefined;
            }
            node = node.children[index];
        }
    }
    return node;
}
/**
 * Gets the JSON path of the given JSON DOM node
 */
function getNodePath(node) {
    if (!node.parent || !node.parent.children) {
        return [];
    }
    var path = getNodePath(node.parent);
    if (node.parent.type === 'property') {
        var key = node.parent.children[0].value;
        path.push(key);
    }
    else if (node.parent.type === 'array') {
        var index = node.parent.children.indexOf(node);
        if (index !== -1) {
            path.push(index);
        }
    }
    return path;
}
/**
 * Evaluates the JavaScript object of the given JSON DOM node
 */
function getNodeValue(node) {
    switch (node.type) {
        case 'array':
            return node.children.map(getNodeValue);
        case 'object':
            var obj = Object.create(null);
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var prop = _a[_i];
                var valueNode = prop.children[1];
                if (valueNode) {
                    obj[prop.children[0].value] = getNodeValue(valueNode);
                }
            }
            return obj;
        case 'null':
        case 'string':
        case 'number':
        case 'boolean':
            return node.value;
        default:
            return undefined;
    }
}
function contains(node, offset, includeRightBound) {
    if (includeRightBound === void 0) { includeRightBound = false; }
    return (offset >= node.offset && offset < (node.offset + node.length)) || includeRightBound && (offset === (node.offset + node.length));
}
/**
 * Finds the most inner node at the given offset. If includeRightBound is set, also finds nodes that end at the given offset.
 */
function findNodeAtOffset(node, offset, includeRightBound) {
    if (includeRightBound === void 0) { includeRightBound = false; }
    if (contains(node, offset, includeRightBound)) {
        var children = node.children;
        if (Array.isArray(children)) {
            for (var i = 0; i < children.length && children[i].offset <= offset; i++) {
                var item = findNodeAtOffset(children[i], offset, includeRightBound);
                if (item) {
                    return item;
                }
            }
        }
        return node;
    }
    return undefined;
}
/**
 * Parses the given text and invokes the visitor functions for each object, array and literal reached.
 */
function visit(text, visitor, options) {
    if (options === void 0) { options = ParseOptions.DEFAULT; }
    var _scanner = (0,_scanner__WEBPACK_IMPORTED_MODULE_0__.createScanner)(text, false);
    function toNoArgVisit(visitFunction) {
        return visitFunction ? function () { return visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()); } : function () { return true; };
    }
    function toOneArgVisit(visitFunction) {
        return visitFunction ? function (arg) { return visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()); } : function () { return true; };
    }
    var onObjectBegin = toNoArgVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisit(visitor.onObjectProperty), onObjectEnd = toNoArgVisit(visitor.onObjectEnd), onArrayBegin = toNoArgVisit(visitor.onArrayBegin), onArrayEnd = toNoArgVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisit(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
    var disallowComments = options && options.disallowComments;
    var allowTrailingComma = options && options.allowTrailingComma;
    function scanNext() {
        while (true) {
            var token = _scanner.scan();
            switch (_scanner.getTokenError()) {
                case 4 /* InvalidUnicode */:
                    handleError(14 /* InvalidUnicode */);
                    break;
                case 5 /* InvalidEscapeCharacter */:
                    handleError(15 /* InvalidEscapeCharacter */);
                    break;
                case 3 /* UnexpectedEndOfNumber */:
                    handleError(13 /* UnexpectedEndOfNumber */);
                    break;
                case 1 /* UnexpectedEndOfComment */:
                    if (!disallowComments) {
                        handleError(11 /* UnexpectedEndOfComment */);
                    }
                    break;
                case 2 /* UnexpectedEndOfString */:
                    handleError(12 /* UnexpectedEndOfString */);
                    break;
                case 6 /* InvalidCharacter */:
                    handleError(16 /* InvalidCharacter */);
                    break;
            }
            switch (token) {
                case 12 /* LineCommentTrivia */:
                case 13 /* BlockCommentTrivia */:
                    if (disallowComments) {
                        handleError(10 /* InvalidCommentToken */);
                    }
                    else {
                        onComment();
                    }
                    break;
                case 16 /* Unknown */:
                    handleError(1 /* InvalidSymbol */);
                    break;
                case 15 /* Trivia */:
                case 14 /* LineBreakTrivia */:
                    break;
                default:
                    return token;
            }
        }
    }
    function handleError(error, skipUntilAfter, skipUntil) {
        if (skipUntilAfter === void 0) { skipUntilAfter = []; }
        if (skipUntil === void 0) { skipUntil = []; }
        onError(error);
        if (skipUntilAfter.length + skipUntil.length > 0) {
            var token = _scanner.getToken();
            while (token !== 17 /* EOF */) {
                if (skipUntilAfter.indexOf(token) !== -1) {
                    scanNext();
                    break;
                }
                else if (skipUntil.indexOf(token) !== -1) {
                    break;
                }
                token = scanNext();
            }
        }
    }
    function parseString(isValue) {
        var value = _scanner.getTokenValue();
        if (isValue) {
            onLiteralValue(value);
        }
        else {
            onObjectProperty(value);
        }
        scanNext();
        return true;
    }
    function parseLiteral() {
        switch (_scanner.getToken()) {
            case 11 /* NumericLiteral */:
                var tokenValue = _scanner.getTokenValue();
                var value = Number(tokenValue);
                if (isNaN(value)) {
                    handleError(2 /* InvalidNumberFormat */);
                    value = 0;
                }
                onLiteralValue(value);
                break;
            case 7 /* NullKeyword */:
                onLiteralValue(null);
                break;
            case 8 /* TrueKeyword */:
                onLiteralValue(true);
                break;
            case 9 /* FalseKeyword */:
                onLiteralValue(false);
                break;
            default:
                return false;
        }
        scanNext();
        return true;
    }
    function parseProperty() {
        if (_scanner.getToken() !== 10 /* StringLiteral */) {
            handleError(3 /* PropertyNameExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
            return false;
        }
        parseString(false);
        if (_scanner.getToken() === 6 /* ColonToken */) {
            onSeparator(':');
            scanNext(); // consume colon
            if (!parseValue()) {
                handleError(4 /* ValueExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
            }
        }
        else {
            handleError(5 /* ColonExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
        }
        return true;
    }
    function parseObject() {
        onObjectBegin();
        scanNext(); // consume open brace
        var needsComma = false;
        while (_scanner.getToken() !== 2 /* CloseBraceToken */ && _scanner.getToken() !== 17 /* EOF */) {
            if (_scanner.getToken() === 5 /* CommaToken */) {
                if (!needsComma) {
                    handleError(4 /* ValueExpected */, [], []);
                }
                onSeparator(',');
                scanNext(); // consume comma
                if (_scanner.getToken() === 2 /* CloseBraceToken */ && allowTrailingComma) {
                    break;
                }
            }
            else if (needsComma) {
                handleError(6 /* CommaExpected */, [], []);
            }
            if (!parseProperty()) {
                handleError(4 /* ValueExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
            }
            needsComma = true;
        }
        onObjectEnd();
        if (_scanner.getToken() !== 2 /* CloseBraceToken */) {
            handleError(7 /* CloseBraceExpected */, [2 /* CloseBraceToken */], []);
        }
        else {
            scanNext(); // consume close brace
        }
        return true;
    }
    function parseArray() {
        onArrayBegin();
        scanNext(); // consume open bracket
        var needsComma = false;
        while (_scanner.getToken() !== 4 /* CloseBracketToken */ && _scanner.getToken() !== 17 /* EOF */) {
            if (_scanner.getToken() === 5 /* CommaToken */) {
                if (!needsComma) {
                    handleError(4 /* ValueExpected */, [], []);
                }
                onSeparator(',');
                scanNext(); // consume comma
                if (_scanner.getToken() === 4 /* CloseBracketToken */ && allowTrailingComma) {
                    break;
                }
            }
            else if (needsComma) {
                handleError(6 /* CommaExpected */, [], []);
            }
            if (!parseValue()) {
                handleError(4 /* ValueExpected */, [], [4 /* CloseBracketToken */, 5 /* CommaToken */]);
            }
            needsComma = true;
        }
        onArrayEnd();
        if (_scanner.getToken() !== 4 /* CloseBracketToken */) {
            handleError(8 /* CloseBracketExpected */, [4 /* CloseBracketToken */], []);
        }
        else {
            scanNext(); // consume close bracket
        }
        return true;
    }
    function parseValue() {
        switch (_scanner.getToken()) {
            case 3 /* OpenBracketToken */:
                return parseArray();
            case 1 /* OpenBraceToken */:
                return parseObject();
            case 10 /* StringLiteral */:
                return parseString(true);
            default:
                return parseLiteral();
        }
    }
    scanNext();
    if (_scanner.getToken() === 17 /* EOF */) {
        if (options.allowEmptyContent) {
            return true;
        }
        handleError(4 /* ValueExpected */, [], []);
        return false;
    }
    if (!parseValue()) {
        handleError(4 /* ValueExpected */, [], []);
        return false;
    }
    if (_scanner.getToken() !== 17 /* EOF */) {
        handleError(9 /* EndOfFileExpected */, [], []);
    }
    return true;
}
/**
 * Takes JSON with JavaScript-style comments and remove
 * them. Optionally replaces every none-newline character
 * of comments with a replaceCharacter
 */
function stripComments(text, replaceCh) {
    var _scanner = (0,_scanner__WEBPACK_IMPORTED_MODULE_0__.createScanner)(text), parts = [], kind, offset = 0, pos;
    do {
        pos = _scanner.getPosition();
        kind = _scanner.scan();
        switch (kind) {
            case 12 /* LineCommentTrivia */:
            case 13 /* BlockCommentTrivia */:
            case 17 /* EOF */:
                if (offset !== pos) {
                    parts.push(text.substring(offset, pos));
                }
                if (replaceCh !== undefined) {
                    parts.push(_scanner.getTokenValue().replace(/[^\r\n]/g, replaceCh));
                }
                offset = _scanner.getPosition();
                break;
        }
    } while (kind !== 17 /* EOF */);
    return parts.join('');
}
function getNodeType(value) {
    switch (typeof value) {
        case 'boolean': return 'boolean';
        case 'number': return 'number';
        case 'string': return 'string';
        case 'object': {
            if (!value) {
                return 'null';
            }
            else if (Array.isArray(value)) {
                return 'array';
            }
            return 'object';
        }
        default: return 'null';
    }
}


/***/ }),

/***/ "./node_modules/jsonc-parser/lib/esm/impl/scanner.js":
/*!***********************************************************!*\
  !*** ./node_modules/jsonc-parser/lib/esm/impl/scanner.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createScanner": () => (/* binding */ createScanner)
/* harmony export */ });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Creates a JSON scanner on the given text.
 * If ignoreTrivia is set, whitespaces or comments are ignored.
 */
function createScanner(text, ignoreTrivia) {
    if (ignoreTrivia === void 0) { ignoreTrivia = false; }
    var len = text.length;
    var pos = 0, value = '', tokenOffset = 0, token = 16 /* Unknown */, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0 /* None */;
    function scanHexDigits(count, exact) {
        var digits = 0;
        var value = 0;
        while (digits < count || !exact) {
            var ch = text.charCodeAt(pos);
            if (ch >= 48 /* _0 */ && ch <= 57 /* _9 */) {
                value = value * 16 + ch - 48 /* _0 */;
            }
            else if (ch >= 65 /* A */ && ch <= 70 /* F */) {
                value = value * 16 + ch - 65 /* A */ + 10;
            }
            else if (ch >= 97 /* a */ && ch <= 102 /* f */) {
                value = value * 16 + ch - 97 /* a */ + 10;
            }
            else {
                break;
            }
            pos++;
            digits++;
        }
        if (digits < count) {
            value = -1;
        }
        return value;
    }
    function setPosition(newPosition) {
        pos = newPosition;
        value = '';
        tokenOffset = 0;
        token = 16 /* Unknown */;
        scanError = 0 /* None */;
    }
    function scanNumber() {
        var start = pos;
        if (text.charCodeAt(pos) === 48 /* _0 */) {
            pos++;
        }
        else {
            pos++;
            while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
            }
        }
        if (pos < text.length && text.charCodeAt(pos) === 46 /* dot */) {
            pos++;
            if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
            }
            else {
                scanError = 3 /* UnexpectedEndOfNumber */;
                return text.substring(start, pos);
            }
        }
        var end = pos;
        if (pos < text.length && (text.charCodeAt(pos) === 69 /* E */ || text.charCodeAt(pos) === 101 /* e */)) {
            pos++;
            if (pos < text.length && text.charCodeAt(pos) === 43 /* plus */ || text.charCodeAt(pos) === 45 /* minus */) {
                pos++;
            }
            if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
                end = pos;
            }
            else {
                scanError = 3 /* UnexpectedEndOfNumber */;
            }
        }
        return text.substring(start, end);
    }
    function scanString() {
        var result = '', start = pos;
        while (true) {
            if (pos >= len) {
                result += text.substring(start, pos);
                scanError = 2 /* UnexpectedEndOfString */;
                break;
            }
            var ch = text.charCodeAt(pos);
            if (ch === 34 /* doubleQuote */) {
                result += text.substring(start, pos);
                pos++;
                break;
            }
            if (ch === 92 /* backslash */) {
                result += text.substring(start, pos);
                pos++;
                if (pos >= len) {
                    scanError = 2 /* UnexpectedEndOfString */;
                    break;
                }
                var ch2 = text.charCodeAt(pos++);
                switch (ch2) {
                    case 34 /* doubleQuote */:
                        result += '\"';
                        break;
                    case 92 /* backslash */:
                        result += '\\';
                        break;
                    case 47 /* slash */:
                        result += '/';
                        break;
                    case 98 /* b */:
                        result += '\b';
                        break;
                    case 102 /* f */:
                        result += '\f';
                        break;
                    case 110 /* n */:
                        result += '\n';
                        break;
                    case 114 /* r */:
                        result += '\r';
                        break;
                    case 116 /* t */:
                        result += '\t';
                        break;
                    case 117 /* u */:
                        var ch3 = scanHexDigits(4, true);
                        if (ch3 >= 0) {
                            result += String.fromCharCode(ch3);
                        }
                        else {
                            scanError = 4 /* InvalidUnicode */;
                        }
                        break;
                    default:
                        scanError = 5 /* InvalidEscapeCharacter */;
                }
                start = pos;
                continue;
            }
            if (ch >= 0 && ch <= 0x1f) {
                if (isLineBreak(ch)) {
                    result += text.substring(start, pos);
                    scanError = 2 /* UnexpectedEndOfString */;
                    break;
                }
                else {
                    scanError = 6 /* InvalidCharacter */;
                    // mark as error but continue with string
                }
            }
            pos++;
        }
        return result;
    }
    function scanNext() {
        value = '';
        scanError = 0 /* None */;
        tokenOffset = pos;
        lineStartOffset = lineNumber;
        prevTokenLineStartOffset = tokenLineStartOffset;
        if (pos >= len) {
            // at the end
            tokenOffset = len;
            return token = 17 /* EOF */;
        }
        var code = text.charCodeAt(pos);
        // trivia: whitespace
        if (isWhiteSpace(code)) {
            do {
                pos++;
                value += String.fromCharCode(code);
                code = text.charCodeAt(pos);
            } while (isWhiteSpace(code));
            return token = 15 /* Trivia */;
        }
        // trivia: newlines
        if (isLineBreak(code)) {
            pos++;
            value += String.fromCharCode(code);
            if (code === 13 /* carriageReturn */ && text.charCodeAt(pos) === 10 /* lineFeed */) {
                pos++;
                value += '\n';
            }
            lineNumber++;
            tokenLineStartOffset = pos;
            return token = 14 /* LineBreakTrivia */;
        }
        switch (code) {
            // tokens: []{}:,
            case 123 /* openBrace */:
                pos++;
                return token = 1 /* OpenBraceToken */;
            case 125 /* closeBrace */:
                pos++;
                return token = 2 /* CloseBraceToken */;
            case 91 /* openBracket */:
                pos++;
                return token = 3 /* OpenBracketToken */;
            case 93 /* closeBracket */:
                pos++;
                return token = 4 /* CloseBracketToken */;
            case 58 /* colon */:
                pos++;
                return token = 6 /* ColonToken */;
            case 44 /* comma */:
                pos++;
                return token = 5 /* CommaToken */;
            // strings
            case 34 /* doubleQuote */:
                pos++;
                value = scanString();
                return token = 10 /* StringLiteral */;
            // comments
            case 47 /* slash */:
                var start = pos - 1;
                // Single-line comment
                if (text.charCodeAt(pos + 1) === 47 /* slash */) {
                    pos += 2;
                    while (pos < len) {
                        if (isLineBreak(text.charCodeAt(pos))) {
                            break;
                        }
                        pos++;
                    }
                    value = text.substring(start, pos);
                    return token = 12 /* LineCommentTrivia */;
                }
                // Multi-line comment
                if (text.charCodeAt(pos + 1) === 42 /* asterisk */) {
                    pos += 2;
                    var safeLength = len - 1; // For lookahead.
                    var commentClosed = false;
                    while (pos < safeLength) {
                        var ch = text.charCodeAt(pos);
                        if (ch === 42 /* asterisk */ && text.charCodeAt(pos + 1) === 47 /* slash */) {
                            pos += 2;
                            commentClosed = true;
                            break;
                        }
                        pos++;
                        if (isLineBreak(ch)) {
                            if (ch === 13 /* carriageReturn */ && text.charCodeAt(pos) === 10 /* lineFeed */) {
                                pos++;
                            }
                            lineNumber++;
                            tokenLineStartOffset = pos;
                        }
                    }
                    if (!commentClosed) {
                        pos++;
                        scanError = 1 /* UnexpectedEndOfComment */;
                    }
                    value = text.substring(start, pos);
                    return token = 13 /* BlockCommentTrivia */;
                }
                // just a single slash
                value += String.fromCharCode(code);
                pos++;
                return token = 16 /* Unknown */;
            // numbers
            case 45 /* minus */:
                value += String.fromCharCode(code);
                pos++;
                if (pos === len || !isDigit(text.charCodeAt(pos))) {
                    return token = 16 /* Unknown */;
                }
            // found a minus, followed by a number so
            // we fall through to proceed with scanning
            // numbers
            case 48 /* _0 */:
            case 49 /* _1 */:
            case 50 /* _2 */:
            case 51 /* _3 */:
            case 52 /* _4 */:
            case 53 /* _5 */:
            case 54 /* _6 */:
            case 55 /* _7 */:
            case 56 /* _8 */:
            case 57 /* _9 */:
                value += scanNumber();
                return token = 11 /* NumericLiteral */;
            // literals and unknown symbols
            default:
                // is a literal? Read the full word.
                while (pos < len && isUnknownContentCharacter(code)) {
                    pos++;
                    code = text.charCodeAt(pos);
                }
                if (tokenOffset !== pos) {
                    value = text.substring(tokenOffset, pos);
                    // keywords: true, false, null
                    switch (value) {
                        case 'true': return token = 8 /* TrueKeyword */;
                        case 'false': return token = 9 /* FalseKeyword */;
                        case 'null': return token = 7 /* NullKeyword */;
                    }
                    return token = 16 /* Unknown */;
                }
                // some
                value += String.fromCharCode(code);
                pos++;
                return token = 16 /* Unknown */;
        }
    }
    function isUnknownContentCharacter(code) {
        if (isWhiteSpace(code) || isLineBreak(code)) {
            return false;
        }
        switch (code) {
            case 125 /* closeBrace */:
            case 93 /* closeBracket */:
            case 123 /* openBrace */:
            case 91 /* openBracket */:
            case 34 /* doubleQuote */:
            case 58 /* colon */:
            case 44 /* comma */:
            case 47 /* slash */:
                return false;
        }
        return true;
    }
    function scanNextNonTrivia() {
        var result;
        do {
            result = scanNext();
        } while (result >= 12 /* LineCommentTrivia */ && result <= 15 /* Trivia */);
        return result;
    }
    return {
        setPosition: setPosition,
        getPosition: function () { return pos; },
        scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
        getToken: function () { return token; },
        getTokenValue: function () { return value; },
        getTokenOffset: function () { return tokenOffset; },
        getTokenLength: function () { return pos - tokenOffset; },
        getTokenStartLine: function () { return lineStartOffset; },
        getTokenStartCharacter: function () { return tokenOffset - prevTokenLineStartOffset; },
        getTokenError: function () { return scanError; },
    };
}
function isWhiteSpace(ch) {
    return ch === 32 /* space */ || ch === 9 /* tab */ || ch === 11 /* verticalTab */ || ch === 12 /* formFeed */ ||
        ch === 160 /* nonBreakingSpace */ || ch === 5760 /* ogham */ || ch >= 8192 /* enQuad */ && ch <= 8203 /* zeroWidthSpace */ ||
        ch === 8239 /* narrowNoBreakSpace */ || ch === 8287 /* mathematicalSpace */ || ch === 12288 /* ideographicSpace */ || ch === 65279 /* byteOrderMark */;
}
function isLineBreak(ch) {
    return ch === 10 /* lineFeed */ || ch === 13 /* carriageReturn */ || ch === 8232 /* lineSeparator */ || ch === 8233 /* paragraphSeparator */;
}
function isDigit(ch) {
    return ch >= 48 /* _0 */ && ch <= 57 /* _9 */;
}


/***/ }),

/***/ "./node_modules/jsonc-parser/lib/esm/main.js":
/*!***************************************************!*\
  !*** ./node_modules/jsonc-parser/lib/esm/main.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createScanner": () => (/* binding */ createScanner),
/* harmony export */   "getLocation": () => (/* binding */ getLocation),
/* harmony export */   "parse": () => (/* binding */ parse),
/* harmony export */   "parseTree": () => (/* binding */ parseTree),
/* harmony export */   "findNodeAtLocation": () => (/* binding */ findNodeAtLocation),
/* harmony export */   "findNodeAtOffset": () => (/* binding */ findNodeAtOffset),
/* harmony export */   "getNodePath": () => (/* binding */ getNodePath),
/* harmony export */   "getNodeValue": () => (/* binding */ getNodeValue),
/* harmony export */   "visit": () => (/* binding */ visit),
/* harmony export */   "stripComments": () => (/* binding */ stripComments),
/* harmony export */   "printParseErrorCode": () => (/* binding */ printParseErrorCode),
/* harmony export */   "format": () => (/* binding */ format),
/* harmony export */   "modify": () => (/* binding */ modify),
/* harmony export */   "applyEdits": () => (/* binding */ applyEdits)
/* harmony export */ });
/* harmony import */ var _impl_format__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./impl/format */ "./node_modules/jsonc-parser/lib/esm/impl/format.js");
/* harmony import */ var _impl_edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./impl/edit */ "./node_modules/jsonc-parser/lib/esm/impl/edit.js");
/* harmony import */ var _impl_scanner__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./impl/scanner */ "./node_modules/jsonc-parser/lib/esm/impl/scanner.js");
/* harmony import */ var _impl_parser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./impl/parser */ "./node_modules/jsonc-parser/lib/esm/impl/parser.js");
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/





/**
 * Creates a JSON scanner on the given text.
 * If ignoreTrivia is set, whitespaces or comments are ignored.
 */
var createScanner = _impl_scanner__WEBPACK_IMPORTED_MODULE_2__.createScanner;
/**
 * For a given offset, evaluate the location in the JSON document. Each segment in the location path is either a property name or an array index.
 */
var getLocation = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.getLocation;
/**
 * Parses the given text and returns the object the JSON content represents. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
 * Therefore, always check the errors list to find out if the input was valid.
 */
var parse = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.parse;
/**
 * Parses the given text and returns a tree representation the JSON content. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
 */
var parseTree = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.parseTree;
/**
 * Finds the node at the given path in a JSON DOM.
 */
var findNodeAtLocation = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.findNodeAtLocation;
/**
 * Finds the innermost node at the given offset. If includeRightBound is set, also finds nodes that end at the given offset.
 */
var findNodeAtOffset = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.findNodeAtOffset;
/**
 * Gets the JSON path of the given JSON DOM node
 */
var getNodePath = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.getNodePath;
/**
 * Evaluates the JavaScript object of the given JSON DOM node
 */
var getNodeValue = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.getNodeValue;
/**
 * Parses the given text and invokes the visitor functions for each object, array and literal reached.
 */
var visit = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.visit;
/**
 * Takes JSON with JavaScript-style comments and remove
 * them. Optionally replaces every none-newline character
 * of comments with a replaceCharacter
 */
var stripComments = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.stripComments;
function printParseErrorCode(code) {
    switch (code) {
        case 1 /* InvalidSymbol */: return 'InvalidSymbol';
        case 2 /* InvalidNumberFormat */: return 'InvalidNumberFormat';
        case 3 /* PropertyNameExpected */: return 'PropertyNameExpected';
        case 4 /* ValueExpected */: return 'ValueExpected';
        case 5 /* ColonExpected */: return 'ColonExpected';
        case 6 /* CommaExpected */: return 'CommaExpected';
        case 7 /* CloseBraceExpected */: return 'CloseBraceExpected';
        case 8 /* CloseBracketExpected */: return 'CloseBracketExpected';
        case 9 /* EndOfFileExpected */: return 'EndOfFileExpected';
        case 10 /* InvalidCommentToken */: return 'InvalidCommentToken';
        case 11 /* UnexpectedEndOfComment */: return 'UnexpectedEndOfComment';
        case 12 /* UnexpectedEndOfString */: return 'UnexpectedEndOfString';
        case 13 /* UnexpectedEndOfNumber */: return 'UnexpectedEndOfNumber';
        case 14 /* InvalidUnicode */: return 'InvalidUnicode';
        case 15 /* InvalidEscapeCharacter */: return 'InvalidEscapeCharacter';
        case 16 /* InvalidCharacter */: return 'InvalidCharacter';
    }
    return '<unknown ParseErrorCode>';
}
/**
 * Computes the edits needed to format a JSON document.
 *
 * @param documentText The input text
 * @param range The range to format or `undefined` to format the full content
 * @param options The formatting options
 * @returns A list of edit operations describing the formatting changes to the original document. Edits can be either inserts, replacements or
 * removals of text segments. All offsets refer to the original state of the document. No two edits must change or remove the same range of
 * text in the original document. However, multiple edits can have
 * the same offset, for example multiple inserts, or an insert followed by a remove or replace. The order in the array defines which edit is applied first.
 * To apply edits to an input, you can use `applyEdits`.
 */
function format(documentText, range, options) {
    return _impl_format__WEBPACK_IMPORTED_MODULE_0__.format(documentText, range, options);
}
/**
 * Computes the edits needed to modify a value in the JSON document.
 *
 * @param documentText The input text
 * @param path The path of the value to change. The path represents either to the document root, a property or an array item.
 * If the path points to an non-existing property or item, it will be created.
 * @param value The new value for the specified property or item. If the value is undefined,
 * the property or item will be removed.
 * @param options Options
 * @returns A list of edit operations describing the formatting changes to the original document. Edits can be either inserts, replacements or
 * removals of text segments. All offsets refer to the original state of the document. No two edits must change or remove the same range of
 * text in the original document. However, multiple edits can have
 * the same offset, for example multiple inserts, or an insert followed by a remove or replace. The order in the array defines which edit is applied first.
 * To apply edits to an input, you can use `applyEdits`.
 */
function modify(text, path, value, options) {
    return _impl_edit__WEBPACK_IMPORTED_MODULE_1__.setProperty(text, path, value, options);
}
/**
 * Applies edits to a input string.
 */
function applyEdits(text, edits) {
    for (var i = edits.length - 1; i >= 0; i--) {
        text = _impl_edit__WEBPACK_IMPORTED_MODULE_1__.applyEdit(text, edits[i]);
    }
    return text;
}


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/build.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var jsonc_parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jsonc-parser */ "./node_modules/jsonc-parser/lib/esm/main.js");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);



const judge_plain_object = (input) => typeof input === "object" && input !== null && input.constructor === Object;
class Lint {
    static run(input) {
        return Lint.query_object(input);
    }
    static query_object(input) {
        if (!judge_plain_object(input))
            return [false, "Input must be an object."];
        const has_rule = "rule" in input;
        if (!has_rule)
            return [false, "Input object must have rule property."];
        const is_type_of_rule_right = Lint.query_type(input.rule);
        if (!is_type_of_rule_right[0])
            return is_type_of_rule_right;
        return [true];
    }
    static query_type(input) {
        if (!Array.isArray(input))
            return [false, "query_type must be an array."];
        // eslint-disable-next-line no-magic-numbers
        const is_length_2 = input.length === 2;
        if (!is_length_2)
            return [false, "Length of query_type must be 2."];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const is_and_or = ["and", "or"].includes(input[0]);
        if (!is_and_or)
            return [false, 'The first content of query_type must be "and" or "or".'];
        const is_second_value_array = Array.isArray(input[1]);
        if (!is_second_value_array)
            return [false, "The second content of query_type must be an array."];
        const is_type_of_second_value_right = (() => {
            let result = [true];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            input[1].forEach((elm) => {
                const is_array = Array.isArray(elm);
                const is_object = judge_plain_object(elm);
                if (is_array) {
                    const lint_result = Lint.query_type(elm);
                    if (!lint_result[0])
                        result = lint_result;
                }
                else if (is_object) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    const lint_result = Lint.query_element(elm);
                    if (!lint_result[0])
                        result = lint_result;
                }
                else {
                    result = [false, "The type of the second content of query_type must be query_type or query_object"];
                }
            });
            return result;
        })();
        if (!is_type_of_second_value_right[0])
            return is_type_of_second_value_right;
        return [true];
    }
    static query_element(input) {
        const has_mode = "mode" in input;
        if (!has_mode)
            return [false, "query_element must have mode property"];
        const is_mode_right = ["include", "exclude"].includes(input.mode);
        if (!is_mode_right)
            return [false, 'The value of mode property of query_element must be "include" or "exclude".'];
        const has_type = "type" in input;
        if (!has_type)
            return [false, "query_element must have type property"];
        const is_type_right = ["text", "hashtag", "name", "id", "link"].includes(input.type);
        if (!is_type_right)
            return [
                false,
                'The value of type property of query_element must be "text", "hashtag", "name", "id" or "link".'
            ];
        const has_string = "string" in input;
        if (!has_string)
            return [false, "query_element must have string property."];
        const is_type_of_string_right = typeof input.string === "string";
        if (!is_type_of_string_right)
            return [false, "The type of string property of query_element must be string."];
        return [true];
    }
}
const generate_cdn_url = (relative_path) => `https://cdn.statically.io/gh/Robot-Inventor/stc-filter/main/${relative_path}?dev=1`;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const is_filter_list = (arg) => {
    try {
        const is_object = judge_plain_object(arg);
        const has_filter = "filter" in arg;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const is_filter_array = Array.isArray(arg.filter);
        const filter_element = (() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            for (const element of arg.filter) {
                const is_element_object = judge_plain_object(element);
                const has_right_property = "dir" in element && "name" in element && "id" in element;
                const property_type = 
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                typeof element.dir === "string" &&
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    typeof element.name === "string" &&
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    typeof element.id === "string";
                if (!(is_element_object && has_right_property && property_type))
                    return false;
            }
            return true;
        })();
        return is_object && has_filter && is_filter_array && filter_element;
    }
    catch {
        return false;
    }
};
const get_filter_list = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = (0,jsonc_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(fs__WEBPACK_IMPORTED_MODULE_0___default().readFileSync("./src/filter/filter_list.json").toString());
    if (is_filter_list(result))
        return result;
    else
        throw new TypeError("The format of filter list is not correct.");
};
try {
    const filter_list = get_filter_list();
    const advanced_filter = {};
    for (const filter of filter_list.filter) {
        const json_file_list = fs__WEBPACK_IMPORTED_MODULE_0___default().readdirSync(path__WEBPACK_IMPORTED_MODULE_2___default().join("./src/filter", filter.dir));
        const filter_content = [];
        json_file_list.forEach((file_name) => {
            if (!/\.jsonc?$/u.test(file_name))
                return;
            try {
                const file_path = path__WEBPACK_IMPORTED_MODULE_2___default().join("./src/filter/", filter.dir, file_name);
                const content = fs__WEBPACK_IMPORTED_MODULE_0___default().readFileSync(file_path, "utf8");
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const content_json = (0,jsonc_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(content.toString());
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const lint_result = Lint.run(content_json);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                if (lint_result[0])
                    filter_content.push(content_json);
                else {
                    throw new SyntaxError(`The file ${file_path} is in the wrong format.\nreason:\n${lint_result[1]}\n\n`);
                }
            }
            catch (err) {
                console.error(err);
            }
        });
        const query_list = [];
        filter_content.forEach((content) => query_list.push(content.rule));
        const joined_filter = {
            rule: ["or", [...query_list]]
        };
        try {
            fs__WEBPACK_IMPORTED_MODULE_0___default().writeFileSync(path__WEBPACK_IMPORTED_MODULE_2___default().join("./dist/filter", `${filter.dir}.json`), JSON.stringify(joined_filter, null, 4), "utf8");
            advanced_filter[filter.name] = {
                id: filter.id,
                url: generate_cdn_url(`dist/filter/${filter.dir}.json`)
            };
        }
        catch (err) {
            console.error(err);
        }
    }
    try {
        fs__WEBPACK_IMPORTED_MODULE_0___default().writeFileSync("./dist/advanced_filter.json", JSON.stringify(advanced_filter, null, 4), "utf8");
    }
    catch (err) {
        console.error(err);
    }
}
catch (err) {
    console.error(err);
}

})();

/******/ })()
;