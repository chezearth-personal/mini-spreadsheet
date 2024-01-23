# Mini-Spreadsheet

## Basic functionality

- The spreadsheet was created with vanilla javascript (no frameworks, although
inspiration was drawn from React!)
- The `index.html` file, as usual, anchors the page with the basic links and set up. The `index.js` script injects the important HTML snippets to make the whole spreadsheet interactive. This file has a good many dependencies, to perform the various bits of fucntionality: setting up the formula bar, setting up the sheet, translating Excel-style cell addresses into more machine-useable column-row coordinates, doing the calculations and managing the storage.
- The app draws a 100 X 100 grid (configurable, up to 702 colums), with an extra row and column for the heading labels. The headings are sticky, meaning they scroll with their corresponding columns or rows, but stay on the top and left of the page.
- Unlike Excel, when you click a cell, you edit it directly (Excel lets you first 'select' the cell, then you edit it when you double-click it). This affects the arrow movements, because if there is data in the cell, the arrow keys will not leave it. However, the TAB or ENTER keys do move out and you can always click another cell with your mouse.
- The current cell's formula is copied up to the formula bar and can be edited there as well. When TAB or ENTER or the refresh button ` = ` is pressed, the result is calculated.
- When you click a cell, the formula you enter (or raw number if that is all you entered) gets stored in one plane of a 3-dimensional array. The array dimensions correspond to columns, rows and formulae or styling. Calculated values are effectively stored in the screen grid.
- The refresh button (` = `) recalculates all formulae on the sheet and reloads the values
- The spreadsheet can handle basic arithmetic formulae with cell references, e.g. `=(A1+B2)*C5`; it distinguishes formula from values with the `=` sign. If any of the referenced cells change, the formula's result changes too.
- Three basic range functions have been included: `SUM()`, `COUNT()` and `AVERAGE()`. The spreadsheet is not case sensitve on function names, nor on cell references. The functions are listed in the `config.json` and are structured as objects there, the idea being that in future, extra keys and values can be added to the functions (as well as extra functions) and the config could hold information about how they are to be proceed, e.g. a function like `PI()` won't take any arguments, whereas a function like `SIN()` would take a single number, `SUM()`, etc. take a range of values and a complex functions like `=DSUM()` take a list of arguments that include ranges.
- Finally, the spreadsheet does basic cell-level formatting, just `Bold`, `Italic` and `Underline`.

## Build principles

- The choice was: use table widget or a flex-grid and and a long list of inputs. In the end I went for the flex-grid; it's more modern and the user's movement around the enclosed input boxes is more slick. It was tricky to get the column and row headings sticky.
- I made lots of small functions spread over a number of JS modules. Not having any frameworks means not having any packages either -- no `npm install` to be done. However, there is one exception: I used Vite as a deploy solution.

- Tests were written for the address-to-coorinates converter. Although other test files are on the system, they are empty. It takes a lot of time to write tests! In the real world, with a Production environment, this isn't an option.

- The overall aim was to keep the app composable and extendable, allowing new functionality to be 'plugged in', rather than requiring new code builds.

## Building and running

To build and run the app locally on your machine, clone this repo and `cd` into the working directory. Then `npm run build` will have Vite install the dependencies and build the code. To run it on your local machine, use `npm run dev`. To run the few tests that have been written, use `npm run test`.
