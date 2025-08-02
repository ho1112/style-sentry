# Style Sentry

Style Sentry is a custom CSS linter and VSCode extension designed to enforce your team's design system and coding standards.

---

## Table of Contents
- [English](#style-sentry)
- [日本語 (Japanese)](#style-sentry-日本語)
- [한국어 (Korean)](#style-sentry-한국어)

---

## Style Sentry (English)

### Features

- **Unused CSS Class Detection:** Finds CSS classes that are defined but not used in your JSX/TSX files. Supports `.css`, `.scss`, and `.less` files.
- **Design System Color Check:** Checks if the colors used are from your design system's palette. Supports `.css`, `.scss`, and `.less` files. **Note:** This rule currently skips validation for declarations using preprocessor variables (e.g., `$variable`, `@variable`) as it cannot resolve their final color values.
- **Numeric Property Limits:** Checks for limits on numeric CSS properties (e.g., `z-index`, `font-size`, `width`) to maintain consistency and prevent issues. Supports `.css`, `.scss`, and `.less` files.

### Installation

#### CLI Tool

To use the Style Sentry CLI, install it globally from the project root:

```bash
npm install -g .
```

#### VSCode Extension

To build and install the VSCode extension:

1.  Navigate to the `style-sentry-vscode` directory.
2.  Run `npm install` to install dependencies.
3.  Run `npm run compile` to compile the TypeScript code.
4.  In VSCode, open the Extensions view, click the `...` menu, select `Install from VSIX...`, and choose the `style-sentry-vscode-0.0.1.vsix` file.

### Getting Started

Before using Style Sentry, you need a `.stylesentryrc.js` configuration file in your project root. To easily generate this file, run the following command:

```bash
npx style-sentry init
```

This command will create a `.stylesentryrc.js` file with a basic configuration.

### Configuration

Style Sentry is configured using a `.stylesentryrc.js` file in the root of your project. Here is an example configuration:

```javascript
module.exports = {
  rules: {
    'no-unused-classes': true,
    'design-system-colors': {
      allowedColors: ['#FFFFFF', '#000000', 'blue', 'red', 'green'],
    },
    'numeric-property-limits': {
      'z-index': { threshold: 100, operator: '>=' },
      'font-size': { threshold: 32, operator: '>=' },
    },
  },
};
```

### Usage

#### CLI

To run the linter from the command line, execute the `style-sentry` command in your project's root directory:

```bash
style-sentry
```

To get the output in JSON format, use the `--json` flag:

```bash
style-sentry --json
```

#### VSCode Extension

Once the extension is installed and enabled, it will automatically lint your CSS files when you open or save them. Errors and warnings will be displayed directly in the editor.

---

## Style Sentry (日本語)

### 主な機能

- **未使用のCSSクラスの検出:** CSSで定義されているが、JSX/TSXファイルで使用されていないクラスを検出します。`.css`、`.scss`、`.less`ファイルをサポートします。
- **デザインシステムのカラー規則のチェック:** 使用されている色がデザインシステムのカラーパレットで定義されたものであるかを確認します。`.css`、`.scss`、`.less`ファイルをサポートします。**注:** このルールは現在、プリプロセッサ変数（例: `$variable`、`@variable`）を使用する宣言については、最終的な色値を解決できないため、検証をスキップします。
- **数値プロパティの制限のチェック:** `z-index`、`font-size`、`width`などの数値CSSプロパティの制限をチェックし、一貫性を維持し、問題を防止します。`.css`、`.scss`、`.less`ファイルをサポートします。

### インストール方法

#### CLIツール

Style Sentry CLIを使用するには、プロジェクトのルートで次のコマンドを実行してグローバルにインストールします:

```bash
npm install -g .
```

#### VSCode拡張機能

VSCode拡張機能をビルドしてインストールするには:

1.  `style-sentry-vscode` ディレクトリに移動します。
2.  `npm install` コマンドで依存関係をインストールします。
3.  `npm run compile` コマンドでTypeScriptコードをコンパイルします。
4.  VSCodeの拡張機能ビューで `...` メニューをクリックし、「VSIXからインストール...」を選択して `style-sentry-vscode-0.0.1.vsix` ファイルをインストールします。

### はじめに

Style Sentryを使用する前に、プロジェクトのルートに `.stylesentryrc.js` 設定ファイルが必要です。このファイルを簡単に生成するには、次のコマンドを実行します:

```bash
npx style-sentry init
```

このコマンドは、基本的な設定を持つ `.stylesentryrc.js` ファイルを生成します。

### 設定

Style Sentryは、プロジェクトのルートにある `.stylesentryrc.js` ファイルで設定します。以下は設定例です:

```javascript
module.exports = {
  rules: {
    'no-unused-classes': true,
    'design-system-colors': {
      allowedColors: ['#FFFFFF', '#000000', 'blue', 'red', 'green'],
    },
    'numeric-property-limits': {
      'z-index': { threshold: 100, operator: '>=' },
      'font-size': { threshold: 32, operator: '>=' },
    },
  },
};
```

### 使用方法

#### CLI

コマンドラインからリンターを実行するには、プロジェクトのルートディレクトリで `style-sentry` コマンドを実行します:

```bash
style-sentry
```

結果をJSON形式で取得するには、`--json` フラグを使用します:

```bash
style-sentry --json
```

#### VSCode拡張機能

拡張機能がインストールされて有効になると、CSSファイルを開いたり保存したりするたびに自動的にリンティングが実行されます。エラーや警告はエディタに直接表示されます。

---

## Style Sentry (한국어)

### 주요 기능

- **미사용 CSS 클래스 검출:** CSS에 정의되었지만 JSX/TSX 파일에서 사용되지 않는 클래스를 찾습니다. `.css`, `.scss`, `.less` 파일을 지원합니다.
- **디자인 시스템 색상 규칙 검사:** 사용된 색상이 디자인 시스템의 색상 팔레트에 정의된 것인지 확인합니다. `.css`, `.scss`, `.less` 파일을 지원합니다. **참고:** 이 규칙은 현재 전처리기 변수(예: `$variable`, `@variable`)를 사용하는 선언에 대해서는 최종 색상 값을 확인할 수 없으므로 유효성 검사를 건너뜁니다.
- **숫자 속성 제한 검사:** `z-index`, `font-size`, `width`와 같은 숫자 CSS 속성에 대한 제한을 확인하여 일관성을 유지하고 문제를 방지합니다. `.css`, `.scss`, `.less` 파일을 지원합니다.

### 설치 방법

#### CLI 도구

Style Sentry CLI를 사용하려면, 프로젝트 루트에서 다음 명령어로 전역 설치합니다:

```bash
npm install -g .
```

#### VSCode 확장 프로그램

VSCode 확장 프로그램을 빌드하고 설치하려면:

1.  `style-sentry-vscode` 디렉토리로 이동합니다.
2.  `npm install` 명령으로 의존성을 설치합니다.
3.  `npm run compile` 명령으로 TypeScript 코드를 컴파일합니다.
4.  VSCode의 확장 프로그램 뷰에서 `...` 메뉴를 클릭한 후, `VSIX에서 설치...`를 선택하여 `style-sentry-vscode-0.0.1.vsix` 파일을 설치합니다.

### 시작하기

Style Sentry를 사용하기 전에 프로젝트 루트에 `.stylesentryrc.js` 설정 파일이 필요합니다. 이 파일을 쉽게 생성하려면 다음 명령어를 실행하세요:

```bash
npx style-sentry init
```

이 명령어는 기본 설정이 포함된 `.stylesentryrc.js` 파일을 생성합니다.

### 설정

Style Sentry는 프로젝트 루트의 `.stylesentryrc.js` 파일을 통해 설정합니다. 아래는 설정 예시입니다:

```javascript
module.exports = {
  rules: {
    'no-unused-classes': true,
    'design-system-colors': {
      allowedColors: ['#FFFFFF', '#000000', 'blue', 'red', 'green'],
    },
    'numeric-property-limits': {
      'z-index': { threshold: 100, operator: '>=' },
      'font-size': { threshold: 32, operator: '>=' },
    },
  },
};
```

### 사용법

#### CLI

커맨드 라인에서 린터를 실행하려면, 프로젝트 루트 디렉토리에서 `style-sentry` 명령을 실행하세요:

```bash
style-sentry
```

결과를 JSON 형식으로 받으려면 `--json` 플래그를 사용하세요:

```bash
style-sentry --json
```

#### VSCode 확장 프로그램

확장 프로그램이 설치되고 활성화되면, CSS 파일을 열거나 저장할 때 자동으로 린팅을 수행합니다. 에러와 경고는 편집기 상에 직접 표시됩니다.