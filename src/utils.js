export const isTextEmpty = (textContent) => {
    return /^\s*$/.test(textContent)
}

export const isCaretAtLastPosition = (element) => {
    // Get the selection object
    const selection = window.getSelection();

    if (selection.rangeCount === 0) return false;

    // Get the range object
    const range = selection.getRangeAt(0);

    // Check if the end offset of the range is equal to the length of the text content
    return range.endOffset === element.textContent.length;
}

export const isTextNode = (node) => {
    return node && node.nodeType === 3;
}

export const startsWithCharacters = (text) => {
    if (typeof text !== "string") return false
    return /^\S/.test(text)
}
