# Style Sentry

<p align="center">
  <img src="./images/style-sentry_256.png" alt="Style Sentry Logo">
</p>

Style Sentry is a custom CSS linter and VSCode extension designed to enforce your team's design system and coding standards.

---

## Table of Contents
- [English](#style-sentry)
- [日本語 (Japanese)](#style-sentry-日本語)
- [한국어 (Korean)](#style-sentry-한국어)

---

## Style Sentry (English)

### Features

- **Unused CSS Class Detection:** Finds CSS classes that are defined but not used in your JSX/TSX files. Supports `.css`, `.scss`, and `.less` files.<br>
Fully supports the `classnames` library (`cn`, `classNames`, `clsx`) for dynamic class composition.<br>
Also automatically supports nested classes within SCSS `@mixin` (e.g., `&.oval`, `&.round`) and TypeScript/webpack alias paths (e.g., `@styles/`, `@components/`).<br>
(Optionally, classes accessed dynamically (e.g., styles[variable]) can be excluded from unused class detection via configuration.)
- **Design System Color Check:** Checks if the colors used are from your design system's palette. Supports `.css`, `.scss`, and `.less` files. **Note:** This rule currently skips validation for declarations using preprocessor variables (e.g., `$variable`, `@variable`) as it cannot resolve their final color values.
- **Numeric Property Limits:** Checks for limits on numeric CSS properties (e.g., `z-index`, `font-size`, `width`) to maintain consistency and prevent issues. Supports `.css`, `.scss`, and `.less` files.

### Installation

#### CLI Tool

To use the Style Sentry CLI, install it globally:

```bash
npm install -g style-sentry
```

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
    'no-unused-classes': {
      enabled: true,
      ignoreDynamicClasses: true,
    },
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

### Limitations & Notes

- **Component-based usage:** Classes used within component implementations (e.g., `&.icon i` used by an `<Icon>` component) may be flagged as unused even if they are actually used in the browser. This is a known limitation of static analysis.
- **Dynamic rendering:** Classes used in conditional rendering or dynamic components may not be detected.
- **CSS-in-JS:** Classes defined in styled-components or CSS-in-JS libraries are not currently supported.
- **False positives:** The linter may occasionally flag classes as unused when they are actually used. Please review flagged classes manually before removal.

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

Enhance your development workflow with the Style Sentry VS Code Extension. It provides real-time linting directly in your editor, displaying errors and warnings as you type or save. This offers immediate feedback and a seamless integration with your coding environment.

Install it from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=leehoyeon.style-sentry-vscode).

---

## Style Sentry (日本語)

### 主な機能

- **未使用のCSSクラスの検出:** CSSで定義されているが、JSX/TSXファイルで使用されていないクラスを検出します。`.css`、`.scss`、`.less`ファイルをサポートします。<br>
`classnames`ライブラリ（`cn`、`classNames`、`clsx`）による動的クラス構成を完全にサポートします。<br>
SCSSの`@mixin`内のネストされたクラス（`&.oval`、`&.round`など）や、TypeScript/webpackのエイリアスパス（`@styles/`、`@components/`など）も自動的にサポートします。<br>
(オプションで、styles[variable] のような動的にアクセスされるクラスは設定により未使用クラス検出から除外できます。)
- **デザインシステムのカラー規則のチェック:** 使用されている色がデザインシステムのカラーパレットで定義されたものであるかを確認します。`.css`、`.scss`、`.less`ファイルをサポートします。**注:** このルールは現在、プリプロセッサ変数（例: `$variable`、`@variable`）を使用する宣言については、最終的な色値を解決できないため、検証をスキップします。
- **数値プロパティの制限のチェック:** `z-index`、`font-size`、`width`などの数値CSSプロパティの制限をチェックし、一貫性を維持し、問題を防止します。`.css`、`.scss`、`.less`ファイルをサポートします。

### インストール方法

#### CLIツール

Style Sentry CLIを使用するには、グローバルにインストールします:

```bash
npm install -g style-sentry
```

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
    'no-unused-classes': {
      enabled: true,
      ignoreDynamicClasses: true,
    },
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

### 制限事項・注意点

- **コンポーネントベースの使用:** コンポーネント実装内で使用されるクラス（例：`<Icon>`コンポーネントで使用される`&.icon i`）は、実際にブラウザで使用されていても未使用としてフラグが立てられる場合があります。これは静的解析の既知の制限です。
- **動的レンダリング:** 条件付きレンダリングや動的コンポーネントで使用されるクラスは検出されない場合があります。
- **CSS-in-JS:** styled-componentsやCSS-in-JSライブラリで定義されたクラスは現在サポートされていません。
- **誤検知:** リンターは実際に使用されているクラスを未使用としてフラグを立てる場合があります。削除前にフラグが立てられたクラスを手動で確認してください。

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

#### VSCode拡張機能

Style Sentry VS Code拡張機能で開発ワークフローを強化しましょう。この拡張機能は、入力または保存時にエディターで直接リアルタイムリンティングを提供し、即座のフィードバックとコーディング環境とのシームレスな統合を実現します。

[Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=leehoyeon.style-sentry-vscode)からインストールしてください。

---

## Style Sentry (한국어)

### 주요 기능

- **미사용 CSS 클래스 검출:** CSS에 정의되었지만 JSX/TSX 파일에서 사용되지 않는 클래스를 찾습니다. `.css`, `.scss`, `.less` 파일을 지원합니다.<br>
`classnames` 라이브러리(`cn`, `classNames`, `clsx`)를 통한 동적 클래스 구성을 완전히 지원합니다.<br>
SCSS의 `@mixin` 내부의 중첩된 클래스(`&.oval`, `&.round` 등)와 TypeScript/webpack의 별칭 경로(`@styles/`, `@components/` 등)도 자동으로 지원합니다.<br>
(옵션) 동적으로 접근되는 클래스(styles[변수])는 설정에 따라 미사용 검사에서 제외할 수 있습니다.
- **디자인 시스템 색상 규칙 검사:** 사용된 색상이 디자인 시스템의 색상 팔레트에 정의된 것인지 확인합니다. `.css`, `.scss`, `.less` 파일을 지원합니다. **참고:** 이 규칙은 현재 전처리기 변수(예: `$variable`, `@variable`)를 사용하는 선언에 대해서는 최종 색상 값을 확인할 수 없으므로 유효성 검사를 건너뜁니다.
- **숫자 속성 제한 검사:** `z-index`, `font-size`, `width`와 같은 숫자 CSS 속성에 대한 제한을 확인하여 일관성을 유지하고 문제를 방지합니다. `.css`, `.scss`, `.less` 파일을 지원합니다.

### 설치 방법

#### CLI 도구

Style Sentry CLI를 사용하려면, 전역 설치합니다:

```bash
npm install -g style-sentry
```

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
    'no-unused-classes': {
      enabled: true,
      ignoreDynamicClasses: true,
    },
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

### 제한사항 및 주의점

- **컴포넌트 기반 사용:** 컴포넌트 구현 내부에서 사용되는 클래스(예: `<Icon>` 컴포넌트에서 사용되는 `&.icon i`)는 실제로 브라우저에서 사용되고 있어도 미사용으로 표시될 수 있습니다. 이는 정적 분석의 알려진 제한사항입니다.
- **동적 렌더링:** 조건부 렌더링이나 동적 컴포넌트에서 사용되는 클래스는 감지되지 않을 수 있습니다.
- **CSS-in-JS:** styled-components나 CSS-in-JS 라이브러리에서 정의된 클래스는 현재 지원되지 않습니다.
- **오탐:** 린터가 실제로 사용되는 클래스를 미사용으로 표시할 수 있습니다. 제거하기 전에 표시된 클래스를 수동으로 확인해주세요.

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

Style Sentry VS Code 확장 프로그램으로 개발 워크플로우를 향상시키세요. 이 확장 프로그램은 코드를 입력하거나 저장할 때 에디터에서 직접 실시간 린팅을 제공하여 즉각적인 피드백과 코딩 환경과의 원활한 통합을 제공합니다.

[Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=leehoyeon.style-sentry-vscode)에서 설치할 수 있습니다.