/**
 * Build styles
 */
 import './index.css';
 import { IconInlineCode } from '@codexteam/icons'
 import { isTextEmpty, isCaretAtLastPosition, isTextNode, startsWithCharacters } from './utils'
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
  constructor({api, config}) {
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

    document.querySelector(config.containerSelector)?.addEventListener("keydown", this.keyListener)
  }


  keyListener = (e) => {
    const codeWrapper = this.api.selection.findParentTag(this.tag, InlineCode.CSS)
    if (e.key !== "ArrowRight" || !codeWrapper) return
    if (!isCaretAtLastPosition(codeWrapper)) return

    codeWrapper.parentElement.normalize()
    const nextSibling = codeWrapper.nextSibling

    if (!isTextNode(nextSibling) || startsWithCharacters(nextSibling.data)) {
      codeWrapper.insertAdjacentText("afterend", "\u00A0")
    } else if (isTextEmpty(nextSibling.data)) {
      nextSibling.replaceWith("\u00A0")
    }
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
