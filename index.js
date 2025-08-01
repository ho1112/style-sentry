#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const postcss = require('postcss');
const postcssScss = require('postcss-scss');
const postcssLess = require('postcss-less');
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const chalk = require('chalk');

const program = new Command();

// Function to load configuration
function loadConfig(configPath) {
    const resolvedPath = path.resolve(process.cwd(), configPath || '.styleguardrc.js');
    if (fs.existsSync(resolvedPath)) {
        try {
            return require(resolvedPath);
        } catch (e) {
            console.error(chalk.red(`Error loading config file: ${e.message}`));
            process.exit(1);
        }
    } else {
        return {}; // Return empty config if not found
    }
}

// Helper to get CSS-like files and their appropriate PostCSS parser
function getCssFilesAndParsers() {
    const files = glob.sync('**/*.{css,scss,less}', { ignore: 'node_modules/**' });
    const fileParsers = {};

    files.forEach(file => {
        const ext = path.extname(file);
        let parser = null;
        switch (ext) {
            case '.scss':
                parser = postcssScss;
                break;
            case '.less':
                parser = postcssLess;
                break;
            case '.css':
            default:
                parser = postcss;
                break;
        }
        fileParsers[file] = parser;
    });
    return fileParsers;
}

// Rule 1: Find unused CSS classes
function findUnusedClasses(config) {
    if (!config.rules || !config.rules['no-unused-classes']) return [];

    const allCssFiles = glob.sync('**/*.{css,scss,less}', { ignore: 'node_modules/**' });
    const jsxFiles = glob.sync('**/*.{jsx,tsx}', { ignore: 'node_modules/**' });

    const definedClassesByFile = new Map(); // Map<filePath, Set<className>>
    const usedClassesByFile = new Map(); // Map<filePath, Set<className>>
    const globallyUsedClasses = new Set(); // For non-module classNames

    // 1. Parse all CSS/SCSS/Less files to find defined classes
    allCssFiles.forEach(file => {
        const fullPath = path.resolve(process.cwd(), file);
        definedClassesByFile.set(fullPath, new Set());
        usedClassesByFile.set(fullPath, new Set()); // Initialize for every CSS file

        const css = fs.readFileSync(file, 'utf8');
        const ext = path.extname(file);
        const parser = ext.includes('scss') ? postcssScss : ext.includes('less') ? postcssLess : postcss;
        
        try {
            const root = parser.parse(css, { from: fullPath });
            root.walkRules(rule => {
                rule.selectors.forEach(selector => {
                    const matches = selector.match(/\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g) || [];
                    matches.forEach(match => definedClassesByFile.get(fullPath).add(match.substring(1)));
                });
            });
        } catch (e) {
            console.error(chalk.red(`Error parsing ${file}: ${e.message}`));
        }
    });

    // 2. Parse all JS/JSX/TSX files to find used classes
    jsxFiles.forEach(file => {
        const code = fs.readFileSync(file, 'utf8');
        const ast = babelParser.parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
        const moduleImports = new Map(); // Map<localName, modulePath>

        traverse(ast, {
            ImportDeclaration: ({ node }) => {
                if (node.source.value.match(/\.(css|scss|less)$/)) {
                    const fullPath = path.resolve(path.dirname(file), node.source.value);
                    if (definedClassesByFile.has(fullPath)) { // Only track imports of existing CSS files
                        const defaultSpecifier = node.specifiers.find(s => s.type === 'ImportDefaultSpecifier' || s.type === 'ImportNamespaceSpecifier');
                        if (defaultSpecifier) {
                            moduleImports.set(defaultSpecifier.local.name, fullPath);
                        }
                    }
                }
            },
            MemberExpression: ({ node }) => {
                if (node.object.type === 'Identifier' && moduleImports.has(node.object.name)) {
                    const modulePath = moduleImports.get(node.object.name);
                    const usedSet = usedClassesByFile.get(modulePath);
                    if (node.property.type === 'Identifier') {
                        usedSet.add(node.property.name);
                    } else if (node.property.type === 'StringLiteral') {
                        usedSet.add(node.property.value);
                    }
                }
            },
            JSXAttribute: ({ node }) => {
                if (node.name.name === 'className' && node.value.type === 'StringLiteral') {
                    const classList = node.value.value.split(' ').filter(Boolean);
                    classList.forEach(cls => globallyUsedClasses.add(cls));
                }
            }
        });
    });

    // 3. Compare defined and used classes for each file
    const unusedClassDetails = [];
    definedClassesByFile.forEach((definedClasses, filePath) => {
        const usedClasses = usedClassesByFile.get(filePath);
        definedClasses.forEach(cls => {
            // A class is unused if:
            // - It's not in the file-specific used set, AND
            // - It's not in the globally used set (for className="...")
            if (!usedClasses.has(cls) && !globallyUsedClasses.has(cls)) {
                unusedClassDetails.push({
                    file: path.relative(process.cwd(), filePath),
                    unusedClass: cls
                });
            }
        });
    });

    return unusedClassDetails;
}

// Rule 2: Check for design system colors
function checkDesignSystemColors(config) {
    const ruleConfig = config.rules['design-system-colors'];
    if (!ruleConfig) return [];

    const { allowedColors } = ruleConfig;
    const fileParsers = getCssFilesAndParsers();
    const violations = [];
    const colorRegex = /(#(?:[0-9a-fA-F]{3}){1,2}\b|\b(?:rgb|hsl)a?\([^)]+\)|\b(?!solid|dotted|dashed|inherit|initial|unset|transparent|none)[a-zA-Z]+\b)/g;

    for (const file in fileParsers) {
        const css = fs.readFileSync(file, 'utf8');
        const root = fileParsers[file].parse(css);
        root.walkDecls(/color|background|border/, decl => {
            // Skip color validation for declarations that use preprocessor variables
            if (decl.value.includes('$') || decl.value.includes('@')) {
                violations.push({ rule: 'design-system-colors', file, line: decl.source.start.line, message: `Preprocessor variable used: ${decl.value}. Direct color validation skipped.` });
                return;
            }

            const matches = decl.value.match(colorRegex);
            if (matches) {
                matches.forEach(match => {
                    if (!allowedColors.includes(match.toLowerCase())) {
                        violations.push({ rule: 'design-system-colors', file, line: decl.source.start.line, message: `Invalid color: ${match}` });
                    }
                });
            }
        });
    }
    return violations;
}

// Rule 3: Check numeric property limits
function checkNumericPropertyLimits(config) {
    const ruleConfig = config.rules['numeric-property-limits'];
    if (!ruleConfig) return [];

    const fileParsers = getCssFilesAndParsers();
    const violations = [];

    for (const file in fileParsers) {
        const css = fs.readFileSync(file, 'utf8');
        const root = fileParsers[file].parse(css);

        for (const property in ruleConfig) {
            const { threshold, operator } = ruleConfig[property];
            root.walkDecls(property, decl => {
                const value = parseFloat(decl.value);
                if (isNaN(value)) return; // Skip if value is not a number

                let isViolated = false;
                switch (operator) {
                    case '>=':
                        isViolated = value >= threshold;
                        break;
                    case '>':
                        isViolated = value > threshold;
                        break;
                    case '<=':
                        isViolated = value <= threshold;
                        break;
                    case '<':
                        isViolated = value < threshold;
                        break;
                    case '==':
                        isViolated = value == threshold;
                        break;
                    case '!=':
                        isViolated = value != threshold;
                        break;
                    default:
                        // Default to >= if operator is not specified or invalid
                        isViolated = value >= threshold;
                }

                if (isViolated) {
                    violations.push({ 
                        rule: 'numeric-property-limits',
                        file,
                        line: decl.source.start.line,
                        message: `${property} value ${value} violates limit ${operator} ${threshold}`
                    });
                }
            });
        }
    }
    return violations;
}

program
    .version('0.0.1')
    .description('A custom CSS linter for your team.')
    .option('-c, --config <path>', 'Path to custom config file')
    .option('--json', 'Output results in JSON format')
    .action(() => {
        const options = program.opts();
        const config = loadConfig(options.config);
        
        if (Object.keys(config).length === 0) {
            if (options.json) {
                console.log(JSON.stringify({ error: 'No configuration found.' }, null, 2));
            } else {
                console.log(chalk.red('No configuration found. Aborting.'));
            }
            return;
        }

        const unusedClassViolations = findUnusedClasses(config).map(detail => ({
            rule: 'no-unused-classes',
            file: detail.file,
            line: 'N/A',
            message: `Unused class: ${detail.unusedClass}`
        }));
        const colorViolations = checkDesignSystemColors(config);
        const numericPropertyViolations = checkNumericPropertyLimits(config);

        const allViolations = [...unusedClassViolations, ...colorViolations, ...numericPropertyViolations];

        if (options.json) {
            console.log(JSON.stringify(allViolations, null, 2));
        } else {
            console.log(chalk.cyan.bold('Style Guard Linting Report'));
            console.log(chalk.cyan('============================'));

            if (unusedClassViolations.length > 0) {
                console.log(chalk.yellow('\nUnused CSS classes found:'));
                const byFile = unusedClassViolations.reduce((acc, v) => {
                    if (!acc[v.file]) acc[v.file] = [];
                    acc[v.file].push(v.message);
                    return acc;
                }, {});

                for (const file in byFile) {
                    console.log(chalk.underline(file));
                    byFile[file].forEach(msg => console.log(`- ${msg}`));
                }
            }

            if (colorViolations.length > 0) {
                console.log(chalk.yellow('\nDesign system color violations found:'));
                colorViolations.forEach(v => console.log(`- ${v.file}:${v.line} - ${v.message}`));
            }

            if (numericPropertyViolations.length > 0) {
                console.log(chalk.yellow('\nNumeric property limit violations found:'));
                numericPropertyViolations.forEach(v => console.log(`- ${v.file}:${v.line} - ${v.message}`));
            }

            console.log(chalk.cyan('\n============================'));
            console.log(chalk.cyan.bold('Linting complete.'));
        }
    });

program.parse(process.argv);