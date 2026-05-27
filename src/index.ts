/**
 * Build styles
 */
import './index.css';
import { IconBrackets } from '@codexteam/icons';
import { API, InlineTool, InlineToolConstructorOptions, SanitizerConfig } from "@editorjs/editorjs";

interface IconClasses {
  base: string;
  active: string;
}

/**
 * Inline Code Tool for the Editor.js
 *
 * Allows to wrap inline fragment and style it somehow.
 */
export default class InlineCode implements InlineTool {
  /**
   * Editor.js API
   */
  private api: API;
  /**
   * Button element for the toolbar
   */
  private button: HTMLButtonElement | null;
  /**
   * Tag representing the term
   */
  private tag: string = 'CODE';
  /**
   * CSS classes for the icon
   */
  private iconClasses: IconClasses;

  /**
   * Class name for term-tag
   *
   * @type {string}
   */
  static get CSS(): string {
    return 'inline-code';
  }

  constructor({ api }: InlineToolConstructorOptions) {
    this.api = api;

    this.button = null;

    this.iconClasses = {
      base: this.api.styles.inlineToolButton,
      active: this.api.styles.inlineToolButtonActive,
    };
  }

  /**
   * Specifies Tool as Inline Toolbar Tool
   *
   * @return {boolean}
   */
  static get isInline(): boolean {
    return true;
  }

  /**
   * Create button element for Toolbar
   *
   * @return {HTMLElement}
   */
  render(): HTMLElement {
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
  surround(range: Range): void {
    if (!range) {
      return;
    }

    let termWrapper = this.api.selection.findParentTag(this.tag, InlineCode.CSS) as HTMLElement;

    if (termWrapper) {
      this.unwrap(termWrapper);
    } else {
      /**
       * Only wrap if the selection itself does not already contain a <code> element.
       * Using cloneContents() scopes the check to the actual selection, not the
       * whole block — this prevents nested <code> tags (#44) while still allowing
       * multiple non-contiguous code spans in the same block (#46).
       */
      const selectionContainsCode = range.cloneContents().querySelector(this.tag) !== null;

      if (!selectionContainsCode) {
        this.wrap(range);
      }
    }
  }

   /**
   * Wrap selection with term-tag
   *
   * @param {Range} range - selected fragment
   */
  wrap(range: Range): void {
    /**
     * Create a wrapper for highlighting
     */
    let span = document.createElement(this.tag);

    span.classList.add(InlineCode.CSS);

    /**
     * SurroundContent throws an error if the Range splits a non-Text node with only one of its boundary points
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents}
     *
     * // range.surroundContents(span);
     */
    span.appendChild(range.extractContents());
    range.insertNode(span);

    /**
     * Expand (add) selection to highlighted block
     */
    this.api.selection.expandToTag(span);
  }

  /**
   * Unwrap term-tag
   *
   * @param {HTMLElement} termWrapper - term wrapper tag
   */
  unwrap(termWrapper: HTMLElement): void {
    /**
     * Expand selection to all term-tag
     */
    this.api.selection.expandToTag(termWrapper);

    const sel = window.getSelection();
    if (!sel) return;

    const range = sel.getRangeAt(0);
    const unwrappedContent = range.extractContents();

    /**
     * Remove empty term-tag
     */
    termWrapper.parentNode?.removeChild(termWrapper);

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
   * 
   * @return {boolean}
   */
  checkState(): boolean {
    const termTag = this.api.selection.findParentTag(this.tag, InlineCode.CSS);

    if (this.button) {
      this.button.classList.toggle(this.iconClasses.active, !!termTag);
    }

    return !!termTag;
  }


  /**
   * Get Tool icon's SVG
   * @return {string}
   */
  get toolboxIcon(): string {
    return IconBrackets;
  }

  /**
   * Sanitizer rule
   * @return {SanitizerConfig}
   */
  static get sanitize(): SanitizerConfig {
    return {
      code: {
        class: InlineCode.CSS,
      },
    };
  }
}
