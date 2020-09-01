# Markdown table prettifier extension for Visual Studio Code

[![Build Status](https://travis-ci.org/darkriszty/MarkdownTablePrettify-VSCodeExt.svg?branch=master)](https://travis-ci.org/darkriszty/MarkdownTablePrettify-VSCodeExt)

Makes tables more readable for humans. Compatible with the Markdown writer plugin's table formatter feature in Atom.

## Features

- Remove redundant ending table border if the beginning has no border, so the table _will not end_ with "|".
- Create missing ending table border if the beginning already has a border, so the table _will end_ with "|".
- Save space by not right-padding the last column if the table has no border.
- Support empty columns inside tables.
- Support column alignment options with ":".

![feature X](assets/animation.gif)

## Extension Settings

The extension is available for markdown language mode. It can either format a selected table (`Format Selection`) or the entire document (`Format Document`).

## Usage

In order for table to be properly formatted, it should contain the header and the body. Header separator should be formatted using `|` and `-` characters (`+` does not work as for now). For example:

```
| Key    | Value   |
|--------|---------|
| Key 1  | Value 1 |
| Key 2  | Value 2 |
```

## Known Issues

- Tables with mixed character widths (eg: CJK) are not always properly formatted (issue #4).
