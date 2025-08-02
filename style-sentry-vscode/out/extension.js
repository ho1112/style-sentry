"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const child_process_1 = require("child_process");
const path = require("path");
let diagnosticCollection;
let lintingDebounceTimer;
let cliPath;
function activate(context) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('style-sentry');
    context.subscriptions.push(diagnosticCollection);
    // Resolve the path to the CLI script relative to the extension's location.
    // This makes it work during development without needing a global install.
    cliPath = require.resolve('style-sentry');
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
function isCssFile(document) {
    return document.languageId === 'css' || document.languageId === 'scss' || document.languageId === 'less';
}
function debounceLint(document) {
    clearTimeout(lintingDebounceTimer);
    lintingDebounceTimer = setTimeout(() => {
        lintDocument(document);
    }, 500); // Wait 500ms after the last event before linting
}
function lintDocument(document) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
        return;
    }
    if (!cliPath) {
        // Should not happen if activate() ran correctly
        return;
    }
    const command = `node "${cliPath}" --json`;
    (0, child_process_1.exec)(command, { cwd: workspaceFolder.uri.fsPath }, (err, stdout, stderr) => {
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
            const diagnostics = [];
            const currentFileRelativePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);
            violations.forEach((violation) => {
                // Normalize both paths to ensure consistent matching
                const normalizedViolationFile = path.normalize(violation.file);
                const normalizedCurrentFile = path.normalize(currentFileRelativePath);
                // Only show diagnostics for the current document
                if (normalizedViolationFile === normalizedCurrentFile) {
                    // The CLI now provides a line number, use it.
                    // VSCode lines are 0-based, so we subtract 1.
                    const line = violation.line - 1;
                    // Ensure the line number is valid for the document
                    if (line >= 0 && line < document.lineCount) {
                        const range = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, document.lineAt(line).text.length));
                        const diagnostic = new vscode.Diagnostic(range, violation.message, vscode.DiagnosticSeverity.Warning);
                        diagnostic.source = 'Style Sentry';
                        diagnostics.push(diagnostic);
                    }
                }
            });
            diagnosticCollection.set(document.uri, diagnostics);
        }
        catch (e) {
            vscode.window.showErrorMessage(`Error parsing Style Sentry output: ${e}`);
        }
    });
}
function deactivate() {
    diagnosticCollection.clear();
}
//# sourceMappingURL=extension.js.map