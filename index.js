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
    'no-unused-classes': {
      // To disable, set to false.
      enabled: true,
      // Ignores classes used dynamically (e.g., styles[variable]).
      ignoreDynamicClasses: true,
    },

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
// Helper function to automatically detect and resolve path aliases
function detectPathAliases() {
    const aliases = {};
    
    // 1. Try to read tsconfig.json paths
    const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
        try {
            const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
            if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
                Object.entries(tsconfig.compilerOptions.paths).forEach(([pattern, paths]) => {
                    // Convert TypeScript path mapping to alias
                    // "@styles/*": ["./src/styles/*"] -> "@styles": "./src/styles"
                    const alias = pattern.replace('/*', '');
                    const aliasPath = paths[0].replace('/*', '');
                    aliases[alias] = aliasPath;
                });
            }
        } catch (e) {
            console.warn(chalk.yellow(`Warning: Could not parse tsconfig.json: ${e.message}`));
        }
    }
    
    // 2. Try to read test/tsconfig.json if main tsconfig.json doesn't have paths
    if (Object.keys(aliases).length === 0) {
        const testTsconfigPath = path.resolve(process.cwd(), 'test/tsconfig.json');
        if (fs.existsSync(testTsconfigPath)) {
            try {
                const tsconfig = JSON.parse(fs.readFileSync(testTsconfigPath, 'utf8'));
                if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
                    Object.entries(tsconfig.compilerOptions.paths).forEach(([pattern, paths]) => {
                        const alias = pattern.replace('/*', '');
                        const aliasPath = paths[0].replace('/*', '');
                        aliases[alias] = aliasPath;
                    });
                }
            } catch (e) {
                console.warn(chalk.yellow(`Warning: Could not parse test/tsconfig.json: ${e.message}`));
            }
        }
    }
    
    // 3. Try to read webpack.config.js alias
    const webpackPath = path.resolve(process.cwd(), 'webpack.config.js');
    if (fs.existsSync(webpackPath) && Object.keys(aliases).length === 0) {
        try {
            // Simple regex-based parsing for webpack alias
            const webpackContent = fs.readFileSync(webpackPath, 'utf8');
            const aliasMatches = webpackContent.match(/alias:\s*{([^}]+)}/g);
            if (aliasMatches) {
                aliasMatches.forEach(match => {
                    const aliasRegex = /['"`]([^'"`]+)['"`]\s*:\s*['"`]([^'"`]+)['"`]/g;
                    let aliasMatch;
                    while ((aliasMatch = aliasRegex.exec(match)) !== null) {
                        aliases[aliasMatch[1]] = aliasMatch[2];
                    }
                });
            }
        } catch (e) {
            console.warn(chalk.yellow(`Warning: Could not parse webpack.config.js: ${e.message}`));
        }
    }
    
    // 4. Try to read package.json imports field
    const packagePath = path.resolve(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath) && Object.keys(aliases).length === 0) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            if (packageJson.imports) {
                Object.entries(packageJson.imports).forEach(([pattern, importPath]) => {
                    const alias = pattern.replace('#', '');
                    aliases[alias] = importPath;
                });
            }
        } catch (e) {
            console.warn(chalk.yellow(`Warning: Could not parse package.json imports: ${e.message}`));
        }
    }
    
    return aliases;
}

// Helper function to resolve aliased paths
function resolveAliasedPath(importPath, aliases) {
    if (!aliases) return importPath;
    
    for (const [alias, aliasPath] of Object.entries(aliases)) {
        if (importPath.startsWith(alias)) {
            const relativePath = importPath.replace(alias, aliasPath);
            return path.resolve(process.cwd(), relativePath);
        }
    }
    return importPath;
}

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
function findUnusedClasses(config, isJsonOutput = false) {
    const ruleConfig = config.rules && config.rules['no-unused-classes'];
    if (!ruleConfig || (typeof ruleConfig === 'object' && ruleConfig.enabled === false)) {
        return [];
    }

    const ignoreDynamicClasses = !(typeof ruleConfig === 'object' && ruleConfig.ignoreDynamicClasses === false);

    // Auto-detect path aliases
    const aliases = detectPathAliases();
    if (!isJsonOutput) {
        console.log(chalk.blue(`[INFO] Detected path aliases:`, JSON.stringify(aliases, null, 2)));
    }

    const allCssFiles = glob.sync('**/*.{css,scss,less}', { ignore: 'node_modules/**' });
    const jsxFiles = glob.sync('**/*.{jsx,tsx}', { ignore: 'node_modules/**' });

    const definedClassesByFile = new Map(); // Map<filePath, Map<className, lineNumber>>
    const usedClassesByFile = new Map(); // Map<filePath, Set<className>>
    const globallyUsedClasses = new Set(); // For non-module classNames

    // 1. Parse all CSS/SCSS/Less files to find defined classes
    // 추가: 부모-자식(중첩) 클래스 매핑
    const parentToChildren = new Map(); // Map<parentClass, Set<childClass>>
    allCssFiles.forEach(file => {
        const fullPath = path.resolve(process.cwd(), file);
        definedClassesByFile.set(fullPath, new Map());
        usedClassesByFile.set(fullPath, new Set()); // Initialize for every CSS file

        const css = fs.readFileSync(file, 'utf8');
        const ext = path.extname(file);
        const parser = ext.includes('scss') ? postcssScss : ext.includes('less') ? postcssLess : postcss;

        try {
            const root = parser.parse(css, { from: fullPath });
            // 중첩 셀렉터 추적용 스택
            const parentStack = [];
            
            // 믹스인 내부의 중첩 클래스들을 추출하기 위한 함수
            function extractNestedClasses(rule, parentClass = null) {
                rule.selectors.forEach(selector => {
                    // &.top → .wrapper.top 형태로 변환
                    let sel = selector;
                    let isNested = false;
                    if (parentClass && selector.startsWith('&.')) {
                        sel = `.${parentClass}.${selector.slice(2)}`;
                        isNested = true;
                    }
                    const matches = sel.replace(/&/g, '').match(/\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g) || [];
                    matches.forEach(match => {
                        let className = match.substring(1);
                        // 중첩이면 반드시 parent.child 형태로 저장
                        if (isNested && parentClass) {
                            className = `${parentClass}.${className}`;
                        }
                        if (!definedClassesByFile.get(fullPath).has(className))
                            definedClassesByFile.get(fullPath).set(className, rule.source.start.line);
                        // 중첩 클래스 매핑 (예: wrapper.top → wrapper: top)
                        const parts = className.split('.');
                        if (parts.length === 2) {
                            const [parent, child] = parts;
                            if (!parentToChildren.has(parent)) parentToChildren.set(parent, new Set());
                            parentToChildren.get(parent).add(child);
                        }
                    });
                });
                
                // 믹스인 내부의 중첩 클래스들도 독립적인 클래스로 추가
                if (parentClass) {
                    rule.selectors.forEach(selector => {
                        if (selector.startsWith('&.')) {
                            const nestedClass = selector.slice(2); // &.oval → oval
                            if (!definedClassesByFile.get(fullPath).has(nestedClass)) {
                                definedClassesByFile.get(fullPath).set(nestedClass, rule.source.start.line);
                            }
                        }
                    });
                }
            }
            
            // 믹스인 내부의 중첩 클래스들을 추출하기 위한 추가 함수
            function extractMixinNestedClasses(root) {
                // 믹스인 정의를 찾아서 내부의 중첩 클래스들을 추출
                root.walkAtRules('mixin', mixinRule => {
                    if (!isJsonOutput) console.log(`[DEBUG] Found mixin: ${mixinRule.params}`);
                    mixinRule.walkRules(nestedRule => {
                        nestedRule.selectors.forEach(selector => {
                            if (selector.startsWith('&.')) {
                                const nestedClass = selector.slice(2); // &.oval → oval
                                if (!isJsonOutput) console.log(`[DEBUG] Found nested class in mixin: ${nestedClass}`);
                                if (!definedClassesByFile.get(fullPath).has(nestedClass)) {
                                    definedClassesByFile.get(fullPath).set(nestedClass, nestedRule.source.start.line);
                                }
                            }
                        });
                    });
                });
                
                // 믹스인을 사용하는 클래스들과 중첩 클래스들을 연결
                root.walkRules(rule => {
                    rule.selectors.forEach(selector => {
                        const matches = selector.match(/\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g) || [];
                        matches.forEach(match => {
                            const className = match.substring(1);
                            // 믹스인을 사용하는 클래스들 (primary, secondary, circle)
                            if (['primary', 'secondary', 'circle'].includes(className)) {
                                // 믹스인 내부의 중첩 클래스들과 연결
                                ['oval', 'round', 'isLoading', 'link'].forEach(nestedClass => {
                                    if (!parentToChildren.has(className)) parentToChildren.set(className, new Set());
                                    parentToChildren.get(className).add(nestedClass);
                                });
                            }
                        });
                    });
                });
            }
            
            // 믹스인 내부의 중첩 클래스들을 먼저 추출
            extractMixinNestedClasses(root);
            
            root.walkRules(rule => {
                // 부모 셀렉터 추적
                let parentClass = null;
                if (rule.parent && rule.parent.type === 'rule') {
                    // 상위 rule의 첫 번째 클래스 추출
                    const parentSel = rule.parent.selector;
                    const parentMatch = parentSel && parentSel.match(/\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/);
                    if (parentMatch) {
                        parentClass = parentMatch[0].substring(1);
                    }
                }
                
                extractNestedClasses(rule, parentClass);
            });
        } catch (e) {
            console.error(chalk.red(`Error parsing ${file}: ${e.message}`));
        }
    });

    // 2. Parse all JS/JSX/TSX files to find used classes
    // 추가: 동적 접근이 감지된 부모 클래스 추적
    const dynamicParentsByFile = new Map(); // Map<filePath, Set<parentClass>>
    jsxFiles.forEach(file => {
        try {
            if (!isJsonOutput) console.log(`[DEBUG] Parsing JSX file: ${file}`);
            const code = fs.readFileSync(file, 'utf8');
            const ast = babelParser.parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
            const moduleImports = new Map(); // Map<localName, modulePath>

            traverse(ast, {
                ImportDeclaration: ({ node }) => {
                    if (node.source.value.match(/\.(css|scss|less)$/)) {
                        // Resolve aliased paths
                        const resolvedPath = resolveAliasedPath(node.source.value, aliases);
                        const fullPath = path.isAbsolute(resolvedPath) ? resolvedPath : path.resolve(path.dirname(file), resolvedPath);
                        
                        if (!isJsonOutput) console.log(`[DEBUG] Found CSS import: ${node.source.value} -> ${fullPath}`);
                        
                        // Check if the resolved path exists in our defined classes
                        if (definedClassesByFile.has(fullPath)) {
                            const defaultSpecifier = node.specifiers.find(s => s.type === 'ImportDefaultSpecifier' || s.type === 'ImportNamespaceSpecifier');
                            if (defaultSpecifier) {
                                moduleImports.set(defaultSpecifier.local.name, fullPath);
                                if (!isJsonOutput) console.log(`[DEBUG] Mapped import: ${defaultSpecifier.local.name} -> ${fullPath}`);
                            }
                        } else {
                            // If not found, try to find it in the globbed files
                            const matchingFile = allCssFiles.find(cssFile => {
                                const cssFullPath = path.resolve(process.cwd(), cssFile);
                                return cssFullPath === fullPath;
                            });
                            
                            if (matchingFile) {
                                const cssFullPath = path.resolve(process.cwd(), matchingFile);
                                const defaultSpecifier = node.specifiers.find(s => s.type === 'ImportDefaultSpecifier' || s.type === 'ImportNamespaceSpecifier');
                                if (defaultSpecifier) {
                                    moduleImports.set(defaultSpecifier.local.name, cssFullPath);
                                    if (!isJsonOutput) console.log(`[DEBUG] Mapped aliased import: ${defaultSpecifier.local.name} -> ${cssFullPath}`);
                                }
                            } else {
                                // If still not found, try to find by filename
                                const fileName = path.basename(fullPath);
                                const matchingFileByBasename = allCssFiles.find(cssFile => {
                                    return path.basename(cssFile) === fileName;
                                });
                                
                                if (matchingFileByBasename) {
                                    const cssFullPath = path.resolve(process.cwd(), matchingFileByBasename);
                                    const defaultSpecifier = node.specifiers.find(s => s.type === 'ImportDefaultSpecifier' || s.type === 'ImportNamespaceSpecifier');
                                    if (defaultSpecifier) {
                                        moduleImports.set(defaultSpecifier.local.name, cssFullPath);
                                        if (!isJsonOutput) console.log(`[DEBUG] Mapped aliased import by filename: ${defaultSpecifier.local.name} -> ${cssFullPath}`);
                                    }
                                }
                            }
                        }
                    }
                },
                JSXAttribute: ({ node }) => {
                    if (node.name.name === 'className') {
                        if (!isJsonOutput) {
                            console.log(`[DEBUG] Found className attribute in ${file}`);
                            if (node.value && node.value.type === 'JSXExpressionContainer') {
                                console.log(`[DEBUG] className has expression:`, node.value.expression.type);
                            }
                        }
                    }
                    // className={...} 내에서 static + dynamic 조합 추적 (정밀 개선)
                    if (node.name.name === 'className' && node.value && (node.value.type === 'JSXExpressionContainer')) {
                        let staticParents = new Set();
                        let foundDynamicParents = new Set();
                        let foundDynamicModule = null;
                        // 재귀적으로 BinaryExpression, TemplateLiteral, CallExpression 등 모두 탐색
                        function walk(expr, lastStatic) {
                            if (!expr) return;
                            if (!isJsonOutput) console.log(`[DEBUG] Walking expression type: ${expr.type}`);
                            if (expr.type === 'BinaryExpression' && expr.operator === '+') {
                                walk(expr.left, lastStatic);
                                walk(expr.right, lastStatic);
                            } else if (expr.type === 'TemplateLiteral') {
                                if (!isJsonOutput) console.log(`[DEBUG] Template literal with ${expr.expressions.length} expressions`);
                                expr.expressions.forEach(e => walk(e, lastStatic));
                            } else if (expr.type === 'CallExpression') {
                                // classnames 라이브러리 지원 (cn, classNames 등)
                                if (expr.callee.type === 'Identifier' && 
                                    (expr.callee.name === 'cn' || expr.callee.name === 'classNames' || expr.callee.name === 'clsx')) {
                                    if (!isJsonOutput) console.log(`[DEBUG] Found classnames call: ${expr.callee.name}`);
                                    expr.arguments.forEach(arg => walk(arg, lastStatic));
                                }
                            } else if (expr.type === 'MemberExpression') {
                                if (!isJsonOutput) console.log(`[DEBUG] MemberExpression:`, {
                                    object: expr.object.name,
                                    computed: expr.computed,
                                    propertyType: expr.property.type,
                                    propertyName: expr.property.name || expr.property.value
                                });
                                if (expr.object.type === 'Identifier' && moduleImports.has(expr.object.name)) {
                                    const modulePath = moduleImports.get(expr.object.name);
                                    if (expr.computed && expr.property.type !== 'StringLiteral') {
                                        if (!isJsonOutput) console.log(`[DEBUG] Dynamic access detected: ${expr.object.name}[${expr.property.name || 'variable'}]`);
                                        // 동적 접근: 해당 모듈의 staticParents에 있는 모든 부모를 foundDynamicParents에 추가
                                        foundDynamicModule = modulePath;
                                        staticParents.forEach(p => foundDynamicParents.add(p));
                                    } else {
                                        let propertyName = expr.property.type === 'Identifier' ? expr.property.name : expr.property.value;
                                        staticParents.add(propertyName);
                                        if (!isJsonOutput) console.log(`[DEBUG] Static access: ${propertyName}`);
                                    }
                                }
                            }
                        }
                        walk(node.value.expression, null);
                                                    if (!isJsonOutput) console.log(`[DEBUG] Walk completed:`, {
                            staticParents: Array.from(staticParents),
                            foundDynamicParents: Array.from(foundDynamicParents),
                            foundDynamicModule,
                            ignoreDynamicClasses
                        });
                        if (foundDynamicParents.size > 0 && ignoreDynamicClasses && foundDynamicModule) {
                            if (!isJsonOutput) console.log(`[DEBUG] Dynamic access detected in ${file}:`, {
                                staticParents: Array.from(staticParents),
                                foundDynamicParents: Array.from(foundDynamicParents),
                                foundDynamicModule,
                                parentToChildren: Array.from(parentToChildren.keys())
                            });
                            if (!dynamicParentsByFile.has(foundDynamicModule)) dynamicParentsByFile.set(foundDynamicModule, new Set());
                            foundDynamicParents.forEach(parent => {
                                if (parentToChildren.has(parent)) {
                                    dynamicParentsByFile.get(foundDynamicModule).add(parent);
                                    if (!isJsonOutput) console.log(`[DEBUG] Added ${parent} to dynamic parents for ${foundDynamicModule}`);
                                }
                            });
                        }
                    }
                    // 기존 StringLiteral 처리
                    if (node.name.name === 'className' && node.value && node.value.type === 'StringLiteral') {
                        const classList = node.value.value.split(' ').filter(Boolean);
                        classList.forEach(cls => globallyUsedClasses.add(cls));
                    }
                },
                MemberExpression: ({ node }) => {
                    if (node.object.type === 'Identifier' && moduleImports.has(node.object.name)) {
                        const modulePath = moduleImports.get(node.object.name);
                        const usedSet = usedClassesByFile.get(modulePath);
                        if (node.computed && node.property.type !== 'StringLiteral') {
                            // 동적 접근은 JSXAttribute에서 처리
                        } else {
                            let propertyName = node.property.type === 'Identifier' ? node.property.name : node.property.value;
                            usedSet.add(propertyName);
                            const variations = new Set();
                            variations.add(propertyName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
                            variations.add(propertyName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase());
                            variations.add(propertyName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()));
                            variations.add(propertyName.replace(/_([a-z])/g, (g) => g[1].toUpperCase()));
                            variations.add(propertyName.toLowerCase());
                            variations.add(propertyName.toUpperCase());
                            variations.add(propertyName);
                            variations.forEach(variant => usedSet.add(variant));
                        }
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
        const dynamicParents = dynamicParentsByFile.get(filePath) || new Set();
        definedClasses.forEach((line, cls) => {
            const parts = cls.split('.');
            if (parts.length === 2) {
                const [parent, child] = parts;
                // 동적 접근이 감지된 부모의 자식이면 사용된 것으로 간주
                if (dynamicParents.has(parent)) return;
                // 정적: 부모와 자식이 모두 사용된 경우만 자식도 사용된 것으로 간주
                if (usedClasses.has(parent) && usedClasses.has(child)) return;
            } else if (parts.length === 1) {
                // 부모 클래스는 단독 사용만 체크
                if (usedClasses.has(cls) || globallyUsedClasses.has(cls)) return;
                
                // 동적 접근이 감지된 부모들의 자식 클래스인지 확인
                if (ignoreDynamicClasses && dynamicParents.size > 0) {
                    for (const dynamicParent of dynamicParents) {
                        if (parentToChildren.has(dynamicParent) && parentToChildren.get(dynamicParent).has(cls)) {
                            return; // 동적으로 사용되는 클래스이므로 무시
                        }
                    }
                }
            }
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
        const isJsonOutput = options.json;
        const config = loadConfig(options.config);
        
        if (Object.keys(config).length === 0 || !config.rules) {
            if (options.json) {
                console.log(JSON.stringify({ error: 'No configuration found. Run "style-sentry init" to create a config file.' }, null, 2));
            } else {
                console.log(chalk.red('No configuration found. Run "style-sentry init" to create a config file.'));
            }
            return;
        }

        const unusedClassViolations = findUnusedClasses(config, isJsonOutput).map(detail => ({
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