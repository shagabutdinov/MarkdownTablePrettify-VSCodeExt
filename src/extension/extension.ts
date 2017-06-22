'use strict';
import * as vscode from 'vscode';
import { TableRangePrettyfier } from "./tableRangePrettyfier";
import { VsWindowLogger } from "../diagnostics/logger";
import { TableFactory } from "../modelFactory/tableFactory";
import { TableValidator } from "../modelFactory/tableValidator";
import { TableViewModelBuilder } from "../viewModelBuilders/tableViewModelBuilder";
import { TableStringWriter } from "../writers/tableStringWriter";

// This method is called when the extension is activated.
// The extension is activated the very first time the command is executed.
export function activate(context: vscode.ExtensionContext): void {
    const MD_MODE: vscode.DocumentFilter = { language: "markdown", scheme: "file" };

    const validator = new TableValidator();
    let disposable = vscode.languages.registerDocumentRangeFormattingEditProvider(
        MD_MODE, new TableRangePrettyfier(
            new TableFactory(validator),
            new TableViewModelBuilder(validator),
            new TableStringWriter(),
            new VsWindowLogger())
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {
}
