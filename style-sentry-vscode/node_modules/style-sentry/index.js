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

const defaultConfig = `module.exports = {
  rules: {
    // Rule: 'no-unused-classes'
    // Finds CSS classes that are defined but not used in your JSX/TSX files.
    // Enabled by default.
    'no-unused-classes': true,

    // Rule: 'design-system-colors'
    // Checks if the colors used are from your design system's palette.
    // To enable, uncomment the 'allowedColors' array and add your colors.
    'design-system-colors': {
      // allowedColors: ['#FFFFFF', '#000000', 'blue', 'red', 'green'],
    },

    // Rule: 'numeric-property-limits'
    // Checks for limits on numeric CSS properties.
    // To enable, uncomment the properties you want to check.
    'numeric-property-limits': {
      // 'z-index': { threshold: 100, operator: '>=' },
      // 'font-size': { threshold: 32, operator: '>=' },
    },
  },
};
`;

// Command to initialize config
program
    .command('init')
    .description('Create a default .stylesentryrc.js configuration file.')
    .action(() => {
        const configPath = path.resolve(process.cwd(), '.stylesentryrc.js');
        if (fs.existsSync(configPath)) {
            console.log(chalk.yellow('.stylesentryrc.js already exists.'));
            return;
        }
        fs.writeFileSync(configPath, defaultConfig);
        console.log(chalk.green('Successfully created .stylesentryrc.js'));
    });

// Function to load configuration
function loadConfig(configPath) {
    const resolvedPath = path.resolve(process.cwd(), configPath || '.stylesentryrc.js');
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

    const definedClassesByFile = new Map(); // Map<filePath, Map<className, lineNumber>>
    const usedClassesByFile = new Map(); // Map<filePath, Set<className>>
    const globallyUsedClasses = new Set(); // For non-module classNames

    // 1. Parse all CSS/SCSS/Less files to find defined classes
    allCssFiles.forEach(file => {
        const fullPath = path.resolve(process.cwd(), file);
        definedClassesByFile.set(fullPath, new Map());
        usedClassesByFile.set(fullPath, new Set()); // Initialize for every CSS file

        const css = fs.readFileSync(file, 'utf8');
        const ext = path.extname(file);
        const parser = ext.includes('scss') ? postcssScss : ext.includes('less') ? postcssLess : postcss;

        try {
            const root = parser.parse(css, { from: fullPath });
            root.walkRules(rule => {
                rule.selectors.forEach(selector => {
                    const matches = selector.match(/\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g) || [];
                    matches.forEach(match => {
                        const className = match.substring(1);
                        // Store the line number with the class name, only if it's the first time we see it.
                        if (!definedClassesByFile.get(fullPath).has(className))
                            definedClassesByFile.get(fullPath).set(className, rule.source.start.line);
                    });
                });
            });
        } catch (e) {
            console.error(chalk.red(`Error parsing ${file}: ${e.message}`));
        }
    });

    // 2. Parse all JS/JSX/TSX files to find used classes
    jsxFiles.forEach(file => {
        try {
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
        } catch (e) {
            console.error(chalk.yellow(`Warning: Could not parse ${file}. It may contain syntax errors. Error: ${e.message}`));
        }
    });

    // 3. Compare defined and used classes for each file
    const unusedClassDetails = [];
    definedClassesByFile.forEach((definedClasses, filePath) => {
        const usedClasses = usedClassesByFile.get(filePath);
        definedClasses.forEach((line, cls) => {
            if (!usedClasses.has(cls) && !globallyUsedClasses.has(cls)) {
                unusedClassDetails.push({
                    file: path.relative(process.cwd(), filePath),
                    unusedClass: cls,
                    line: line
                });
            }
        });
    });

    return unusedClassDetails;
}

// Rule 2: Check for design system colors
function checkDesignSystemColors(config) {
    const ruleConfig = config.rules['design-system-colors'];
    if (!ruleConfig || !Array.isArray(ruleConfig.allowedColors) || ruleConfig.allowedColors.length === 0) {
        return [];
    }

    const { allowedColors } = ruleConfig;
    const fileParsers = getCssFilesAndParsers();
    const violations = [];
    const colorRegex = /(#(?:[0-9a-fA-F]{3}){1,2}\b|\b(?:rgb|hsl)a?\([^)]+\)|\b(?!solid|dotted|dashed|inherit|initial|unset|transparent|none)[a-zA-Z]+\b)/g;

    for (const file in fileParsers) {
        const css = fs.readFileSync(file, 'utf8');
        const root = fileParsers[file].parse(css);
        root.walkDecls(/color|background|border/, decl => {
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
                if (isNaN(value)) return;

                let isViolated = false;
                switch (operator) {
                    case '>=': isViolated = value >= threshold; break;
                    case '>': isViolated = value > threshold; break;
                    case '<=': isViolated = value <= threshold; break;
                    case '<': isViolated = value < threshold; break;
                    case '==': isViolated = value == threshold; break;
                    case '!=': isViolated = value != threshold; break;
                    default: isViolated = value >= threshold;
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
        
        if (Object.keys(config).length === 0 || !config.rules) {
            if (options.json) {
                console.log(JSON.stringify({ error: 'No configuration found. Run "style-sentry init" to create a config file.' }, null, 2));
            } else {
                console.log(chalk.red('No configuration found. Run "style-sentry init" to create a config file.'));
            }
            return;
        }

        const unusedClassViolations = findUnusedClasses(config).map(detail => ({
            rule: 'no-unused-classes',
            file: detail.file,
            line: detail.line,
            message: `Unused class: ${detail.unusedClass}`
        }));
        const colorViolations = checkDesignSystemColors(config);
        const numericPropertyViolations = checkNumericPropertyLimits(config);

        const allViolations = [...unusedClassViolations, ...colorViolations, ...numericPropertyViolations];

        if (options.json) {
            console.log(JSON.stringify(allViolations, null, 2));
        } else {
            if (allViolations.length === 0) {
                console.log(chalk.green.bold('✨ No linting issues found. Your styles are looking great!'));
                return;
            }

            console.log(chalk.cyan.bold('Style Sentry Linting Report'));
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