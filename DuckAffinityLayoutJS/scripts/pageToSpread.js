/*
Header
*/
'use strict';

const { Document } = require('/document.js');
const { DocumentCommand } = require('/commands.js');
class pageSpread {
    #error;
    #activeSpread;
    #pagePixelOffset;
    #pageWidth;
    constructor(spread, pageOffset, pageWidth,error) {
        this.#activeSpread = spread;
        this.#pagePixelOffset = pageOffset;
        this.#pageWidth = pageWidth;
        this.#error = error;
    }
    /*
        This is the spread for a page. Contents can be enumerated through the "children" property.
        If the spread is for facing pages, you will see the objects on both the left and right pages.
        If the spread is for a single page, you will only see the objects on that page.
        To determine which page an object is on, if the X coordinate of the object is less
        than the page width, it's on the even numbered page (the left page). 
        If the X coordinate is greater than the page width, it's on the odd numbered page (the right page).
        */
    get spread() { return this.#activeSpread; }
    /*
     For a spreads with facing pages (like in a book), the even numbered pages are of the "left"
     side of the spread, so the pixel offset is zero. The odd pages are on the right side,
     so the pixel offset is the width of the page. The first and last pages of a facing page layout
     are single pages, so their offset is zero.
     For single page spread documents (such as most PDFs), it is 0.
     */
    get pagePixelOffset() { return this.pagePixelOffset };
    /*
    This is the page width in pixels. For example, in an ANSI letter sized document,
    at 300 DPI, this is 2550 pixels. 
    This is used to determine if an object is on the left or right page of a spread.
    */
    get pageWidth() { return this.#pageWidth; }
    isLeftPage(x) { return x < this.#pageWidth; }
    isRightPage(x) { return x >= this.#pageWidth; }
    get isValid() { return this.#activeSpread !== null && this.#activeSpread !== undefined; }
    get error() { return this.#error; }
}
class pageToSpread {

    #activeDocument;
    constructor(doc) {
        if (!doc) {
            this.#activeDocument = Document.current;
        }
        else {
            this.#activeDocument = doc;
        }
    }

    findPage(pageNum, selectSpread) {
        if (!this.#activeDocument) {
            return new pageSpread(null, null, "No active document");
        }

        // a spread is usually a single or double page. If a spread is
        // created over more than two pages, we will fail.
        for (const spread of this.#activeDocument.spreads) {
            if (spread.firstPageIndex <= pageNum && spread.lastPageIndex >= pageNum) {
                // not a spread we can deal with?
                if ( (spread.lastPageIndex - spread.firstPageIndex) > 1 ) {
                    return new pageSpread(null, null, `Page ${pageNum} is not in a valid spread`);
                }
                // this is our spread
                if (selectSpread) this.#activeDocument.executeCommand(DocumentCommand.createSetCurrentSpread(spread));

                // the offset is the page width if this is an event numbered page in a spread
                // TODO - margins and gutter?
                const offset = (spread.firstPageIndex === pageNum) ? 0 : spread.spreadBaseBox.width;
                return new pageSpread(spread, offset, null);
            }
        }
        return new pageSpread(null, null, `Page ${pageNum} not found`);
    }
}