import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('style-guard');
    context.subscriptions.push(diagnosticCollection);

    // Run on save
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
        if (isCssFile(document)) {
            lintDocument(document);
        }
    }));

    // Run on open
    vscode.window.visibleTextEditors.forEach(editor => {
        if (isCssFile(editor.document)) {
            lintDocument(editor.document);
        }
    });
}

function isCssFile(document: vscode.TextDocument): boolean {
    return document.languageId === 'css' || document.languageId === 'scss' || document.languageId === 'less';
}

function lintDocument(document: vscode.TextDocument) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
        return;
    }

    const command = `style-guard --json`;
    exec(command, { cwd: workspaceFolder.uri.fsPath }, (err, stdout, stderr) => {
        if (err && !stdout) { // Real error
            vscode.window.showErrorMessage(`Style Guard error: ${stderr}`);
            return;
        }

        try {
            const violations = JSON.parse(stdout);
            const diagnostics: vscode.Diagnostic[] = [];

            violations.forEach((violation: any) => {
                // For unused classes, we can't determine the file, so we'll skip them for now.
                if (violation.rule === 'no-unused-classes') {
                    return;
                }

                const range = new vscode.Range(
                    new vscode.Position(violation.line - 1, 0),
                    new vscode.Position(violation.line - 1, Number.MAX_VALUE)
                );

                const diagnostic = new vscode.Diagnostic(
                    range,
                    violation.message,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.source = 'Style Guard';
                diagnostics.push(diagnostic);
            });

            diagnosticCollection.set(document.uri, diagnostics);
        } catch (e) {
            vscode.window.showErrorMessage(`Error parsing Style Guard output: ${e}`);
        }
    });
}

export function deactivate() {
    diagnosticCollection.clear();
}