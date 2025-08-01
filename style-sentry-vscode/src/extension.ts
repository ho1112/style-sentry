import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

let diagnosticCollection: vscode.DiagnosticCollection;
let lintingDebounceTimer: NodeJS.Timeout;
let cliPath: string;

export function activate(context: vscode.ExtensionContext) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('style-sentry');
    context.subscriptions.push(diagnosticCollection);

    // Resolve the path to the CLI script relative to the extension's location.
    // This makes it work during development without needing a global install.
    cliPath = path.resolve(context.extensionPath, '../../index.js');

    // Run on save
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
        if (isCssFile(document)) {
            debounceLint(document);
        }
    }));

    // Run on open for already visible editors
    vscode.window.visibleTextEditors.forEach(editor => {
        if (isCssFile(editor.document)) {
            debounceLint(editor.document);
        }
    });

    // Run when a new document is opened
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(document => {
        if (isCssFile(document)) {
            debounceLint(document);
        }
    }));
}

function isCssFile(document: vscode.TextDocument): boolean {
    return document.languageId === 'css' || document.languageId === 'scss' || document.languageId === 'less';
}

function debounceLint(document: vscode.TextDocument) {
    clearTimeout(lintingDebounceTimer);
    lintingDebounceTimer = setTimeout(() => {
        lintDocument(document);
    }, 500); // Wait 500ms after the last event before linting
}

function lintDocument(document: vscode.TextDocument) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
        return;
    }

    if (!cliPath) {
        // Should not happen if activate() ran correctly
        return;
    }

    const command = `node "${cliPath}" --json`;
    exec(command, { cwd: workspaceFolder.uri.fsPath }, (err, stdout, stderr) => {
        if (err && !stdout) { // Real error
            vscode.window.showErrorMessage(`Style Sentry error: ${stderr}`);
            return;
        }

        // The CLI can return violations for multiple files. We need to filter them
        // to only show diagnostics for the currently active document.
        try {
            const result = JSON.parse(stdout);

            // Handle cases where the CLI returns a specific error object, like no config file.
            if (result.error) {
                vscode.window.showInformationMessage(`Style Sentry: ${result.error}`);
                diagnosticCollection.set(document.uri, []); // Clear diagnostics for this file
                return;
            }

            const violations = result;
            const diagnostics: vscode.Diagnostic[] = [];
            const currentFileRelativePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);

            violations.forEach((violation: any) => {
                // Only show diagnostics for the current document
                if (violation.file === currentFileRelativePath) {
                    // The CLI now provides a line number, use it.
                    // VSCode lines are 0-based, so we subtract 1.
                    const line = violation.line - 1;

                    // Ensure the line number is valid for the document
                    if (line >= 0 && line < document.lineCount) {
                        const range = new vscode.Range(
                            new vscode.Position(line, 0),
                            new vscode.Position(line, document.lineAt(line).text.length)
                        );

                        const diagnostic = new vscode.Diagnostic(range, violation.message, vscode.DiagnosticSeverity.Warning);
                        diagnostic.source = 'Style Sentry';
                        diagnostics.push(diagnostic);
                    }
                }
            });

            diagnosticCollection.set(document.uri, diagnostics);
        } catch (e) {
            vscode.window.showErrorMessage(`Error parsing Style Sentry output: ${e}`);
        }
    });
}

export function deactivate() {
    diagnosticCollection.clear();
}