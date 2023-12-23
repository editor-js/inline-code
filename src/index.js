/**
 * Build styles
 */
 import './index.css';
 import { IconInlineCode } from '@codexteam/icons'

/**
 * Inline Code Tool for the Editor.js
 *
 * Allows to wrap inline fragment and style it somehow.
 */
export default class InlineCode {
  /**
   * Class name for term-tag
   *
   * @type {string}
   */
  static get CSS() {
    return 'inline-code';
  };

  /**
   */
  constructor({api}) {
    this.api = api;

    /**
     * Toolbar Button
     *
     * @type {HTMLElement|null}
     */
    this.button = null;

    /**
     * Tag represented the term
     *
     * @type {string}
     */
    this.tag = 'CODE';

    /**
     * CSS classes
     */
    // TODO: Check if possible to control activeness automatically
    this.iconClasses = {
      base: this.api.styles.inlineToolButton,
      active: this.api.styles.inlineToolButtonActive
    };

    window.addEventListener("keydown", this.keyListener)
  }


  isTextEmpty = (textContent) => {
    return /^\s*$/.test(textContent)
  }

  keyListener = (e) => {
    const codeWrapper = this.api.selection.findParentTag(this.tag, InlineCode.CSS)
    if (e.key === "ArrowRight" && codeWrapper) {
      if (!this.isCaretAtLastPosition(codeWrapper)) return

      if (codeWrapper.nextElementSibling) return

      if (!codeWrapper.nextSibling) {
        const emptyChar = document.createTextNode("\u00A0")
        codeWrapper.parentElement.appendChild(emptyChar)

      } else {
        if (this.isTextEmpty(codeWrapper.nextSibling.data)) {
          codeWrapper.nextSibling.insertData(0, "\u00A0")
        }
      }
    }
  }

  isCaretAtLastPosition(element) {
    // Get the selection object
    const selection = window.getSelection();

    if (selection.rangeCount === 0) return false;

    // Get the range object
    const range = selection.getRangeAt(0);

    // Check if the end offset of the range is equal to the length of the text content
    return range.endOffset === element.textContent.length;
  }
  /**
   * Specifies Tool as Inline Toolbar Tool
   *
   * @return {boolean}
   */
  static get isInline() {
    return true;
  }

  /**
   * Create button element for Toolbar
   *
   * @return {HTMLElement}
   */
  render() {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.classList.add(this.iconClasses.base);
    this.button.innerHTML = this.toolboxIcon;

    return this.button;
  }

  /**
   * Wrap/Unwrap selected fragment
   *
   * @param {Range} range - selected fragment
   */
  surround(range) {
    if (!range) {
      return;
    }

    let termWrapper = this.api.selection.findParentTag(this.tag, InlineCode.CSS);

    /**
     * If start or end of selection is in the highlighted block
     */
    if (termWrapper) {
      this.unwrap(termWrapper);
    } else {
      this.wrap(range);
    }
  }

  /**
   * Wrap selection with term-tag
   *
   * @param {Range} range - selected fragment
   */
  wrap(range) {
    /**
     * Create a wrapper for highlighting
     */
    let codeElement = document.createElement(this.tag);

    codeElement.classList.add(InlineCode.CSS);

    /**
     * SurroundContent throws an error if the Range splits a non-Text node with only one of its boundary points
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents}
     *
     * // range.surroundContents(span);
     */
    codeElement.appendChild(range.extractContents());
    range.insertNode(codeElement);

    /**
     * Expand (add) selection to highlighted block
     */
    this.api.selection.expandToTag(codeElement);
  }

  /**
   * Unwrap term-tag
   *
   * @param {HTMLElement} termWrapper - term wrapper tag
   */
  unwrap(termWrapper) {
    /**
     * Expand selection to all term-tag
     */
    this.api.selection.expandToTag(termWrapper);

    let sel = window.getSelection();
    let range = sel.getRangeAt(0);

    let unwrappedContent = range.extractContents();

    /**
     * Remove empty term-tag
     */
    termWrapper.parentNode.removeChild(termWrapper);

    /**
     * Insert extracted content
     */
    range.insertNode(unwrappedContent);

    /**
     * Restore selection
     */
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /**
   * Check and change Term's state for current selection
   */
  checkState() {
    const termTag = this.api.selection.findParentTag(this.tag, InlineCode.CSS);

    this.button.classList.toggle(this.iconClasses.active, !!termTag);
  }

  /**
   * Get Tool icon's SVG
   * @return {string}
   */
  get toolboxIcon() {
    return IconInlineCode;
  }

  /**
   * Sanitizer rule
   * @return {{span: {class: string}}}
   */
  static get sanitize() {
    return {
      code: {
        class: InlineCode.CSS
      }
    };
  }
}
