import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs'; // fs 모듈 추가
import * as os from 'os'; // os 모듈 추가

let diagnosticCollection: vscode.DiagnosticCollection;
let lintingDebounceTimer: NodeJS.Timeout;
let cliPath: string;

export function activate(context: vscode.ExtensionContext) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('style-sentry');
    context.subscriptions.push(diagnosticCollection);

    cliPath = require.resolve('style-sentry');

    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
        if (isCssFile(document)) {
            debounceLint(document);
        }
    }));

    vscode.window.visibleTextEditors.forEach(editor => {
        if (isCssFile(editor.document)) {
            debounceLint(editor.document);
        }
    });

    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(document => {
        if (isCssFile(document)) {
            debounceLint(document);
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('style-sentry')) {
            vscode.window.visibleTextEditors.forEach(editor => {
                if (isCssFile(editor.document)) {
                    debounceLint(editor.document);
                }
            });
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
    }, 500);
}

function lintDocument(document: vscode.TextDocument) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
        return;
    }

    if (!cliPath) {
        return;
    }

    const config = vscode.workspace.getConfiguration('style-sentry');
    const rulesConfig: any = {};

    // no-unused-classes
    const isUnusedClassRuleEnabled = config.get<boolean>('rules.no-unused-classes.enabled');
    const ignorePatterns = config.get<string[]>('rules.no-unused-classes.ignorePatterns');
    const ignoreDynamicClasses = config.get<boolean>('rules.no-unused-classes.ignoreDynamicClasses');

    if (isUnusedClassRuleEnabled !== undefined) {
        const noUnusedClassesCliConfig: { enabled: boolean; ignorePatterns?: string[]; ignoreDynamicClasses?: boolean } = {
            enabled: isUnusedClassRuleEnabled
        };

        if (isUnusedClassRuleEnabled) {
            if (ignorePatterns) {
                noUnusedClassesCliConfig.ignorePatterns = ignorePatterns;
            }
        }
        if (ignoreDynamicClasses !== undefined) {
            noUnusedClassesCliConfig.ignoreDynamicClasses = ignoreDynamicClasses;
        }
        rulesConfig['no-unused-classes'] = noUnusedClassesCliConfig;
    }

    // design-system-colors
    const allowedColors = config.get<string[]>('rules.design-system-colors.allowedColors');
    if (allowedColors && allowedColors.length > 0) {
        rulesConfig['design-system-colors'] = { allowedColors: allowedColors };
    }

    // numeric-property-limits
    const numericPropertyLimits = config.get<any>('rules.numeric-property-limits');
    if (numericPropertyLimits && Object.keys(numericPropertyLimits).length > 0) {
        rulesConfig['numeric-property-limits'] = numericPropertyLimits;
    }

    const tempConfigContent = `module.exports = { rules: ${JSON.stringify(rulesConfig, null, 2)} };`;
    const tempConfigDir = os.tmpdir();
    const tempConfigFileName = `stylesentry-config-${Date.now()}.js`;
    const tempConfigPath = path.join(tempConfigDir, tempConfigFileName);

    try {
        fs.writeFileSync(tempConfigPath, tempConfigContent);

        const command = `node "${cliPath}" --json --config "${tempConfigPath}"`;
        exec(command, { cwd: workspaceFolder.uri.fsPath, maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
            console.log('Style Sentry CLI stdout:', stdout);
            console.log('Style Sentry CLI stderr:', stderr);
            try {
                if (err && !stdout) {
                    vscode.window.showErrorMessage(`Style Sentry error: ${stderr}`);
                    return;
                }

                // If no-unused-classes rule is disabled, clear diagnostics for this rule
                if (!isUnusedClassRuleEnabled) {
                    diagnosticCollection.set(document.uri, []); // Clear diagnostics for the current document
                    return;
                }

                const result = JSON.parse(stdout);

                if (result.error) {
                    if (result.error.includes('No configuration found') && Object.keys(rulesConfig).length === 0) {
                        diagnosticCollection.set(document.uri, []);
                    } else {
                        vscode.window.showInformationMessage(`Style Sentry: ${result.error}`);
                    }
                    return;
                }

                const violations = result;
                const diagnostics: vscode.Diagnostic[] = [];
                const currentFileRelativePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);

                violations.forEach((violation: any) => {
                    const normalizedViolationFile = path.normalize(violation.file);
                    const normalizedCurrentFile = path.normalize(currentFileRelativePath);

                    if (normalizedViolationFile === normalizedCurrentFile) {
                        const line = violation.line - 1;
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
            } finally {
                fs.unlink(tempConfigPath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error(`Failed to delete temporary config file: ${unlinkErr}`);
                    }
                });
            }
        });
    } catch (e: any) {
        vscode.window.showErrorMessage(`Error writing temporary config file: ${e.message}`);
        fs.unlink(tempConfigPath, (unlinkErr) => {
            if (unlinkErr) {
                console.error(`Failed to delete temporary config file after write error: ${unlinkErr}`);
            }
        });
    }
}

export function deactivate() {
    diagnosticCollection.clear();
}