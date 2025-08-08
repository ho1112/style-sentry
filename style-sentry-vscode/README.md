# Style Sentry for VSCode

![Style Sentry in action](https://github.com/ho1112/style-sentry/raw/HEAD/style-sentry-vscode/images/style-setnry_ex.webp)
<p align="center"><em>Style Sentry in action</em></p>

![Style Sentry Settings for vscode](https://github.com/ho1112/style-sentry/raw/HEAD/style-sentry-vscode/images/style-sentry_settings.webp)
<p align="center"><em>Style Sentry Settings for vscode</em></p>

---

## Table of Contents
- [English](#style-sentry-for-vs-code)
- [日本語 (Japanese)](#style-sentry-for-vs-code-日本語)
- [한국어 (Korean)](#style-sentry-for-vs-code-한국어)

---

## Style Sentry for VS Code (English)

**Style Sentry** is a Visual Studio Code extension that integrates the Style Sentry CLI tool directly into your editor, helping you enforce your team's CSS design system and coding standards.

## Features

*   **Real-time Linting:** Automatically checks your `.css`, `.scss`, and `.less` files as you type or save.
*   **Unused CSS Class Detection:** Identifies CSS classes defined but not used in your JSX/TSX files.<br>
Fully supports the `classnames` library (`cn`, `classNames`, `clsx`) for dynamic class composition.<br>
Also automatically supports nested classes within SCSS `@mixin` (e.g., `&.oval`, `&.round`) and TypeScript/webpack alias paths (e.g., `@styles/`, `@components/`).<br>
(Optionally, classes accessed dynamically (e.g., styles[variable]) can be excluded from unused class detection via configuration.)
*   **Design System Color Check:** Verifies if colors used are from your predefined design system palette.
*   **Numeric Property Limits:** Enforces limits on numeric CSS properties like `z-index`, `font-size`, and `width`.

## Limitations & Notes

- **Component-based usage:** Classes used within component implementations (e.g., `&.icon i` used by an `<Icon>` component) may be flagged as unused even if they are actually used in the browser. This is a known limitation of static analysis.
- **Dynamic rendering:** Classes used in conditional rendering or dynamic components may not be detected.
- **CSS-in-JS:** Classes defined in styled-components or CSS-in-JS libraries are not currently supported.
- **False positives:** The linter may occasionally flag classes as unused when they are actually used. Please review flagged classes manually before removal.

## Usage

Style Sentry will automatically lint your CSS files when you open or save them. Errors and warnings will be displayed directly in the editor's problem panel and as inline squiggles.

## Configuration

- **VSCode Extension:**
  - Use the VSCode settings UI: Go to `File > Preferences > Settings > Extensions > Style Sentry` and configure rules such as unused class detection, dynamic class exclusion, etc.
  - No `.stylesentryrc.js` file is required for the extension.

#### Example: VSCode Settings (settings.json)
```json
{
  "style-sentry.rules.no-unused-classes.enabled": true,
  "style-sentry.rules.no-unused-classes.ignoreDynamicClasses": true
}
```

## Installation

1.  Open VS Code.
2.  Go to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3.  Search for "Style Sentry".
4.  Click "Install".

---

**Note:** This extension bundles the Style Sentry CLI, so you do not need to install the CLI separately.

---

## Style Sentry for VS Code (日本語)

**Style Sentry** は、Style Sentry CLI ツールをエディターに直接統合する Visual Studio Code 拡張機能であり、チームの CSS デザインシステムとコーディング標準を強制するのに役立ちます。

## 機能

*   **リアルタイムリンティング:** 入力または保存時に `.css`、`.scss`、`.less` ファイルを自動的にチェックします。
*   **未使用のCSSクラスの検出:** JSX/TSX ファイルで定義されているが使用されていない CSS クラスを識別します。<br>
`classnames`ライブラリ（`cn`、`classNames`、`clsx`）による動的クラス構成を完全にサポートします。<br>
SCSSの`@mixin`内のネストされたクラス（`&.oval`、`&.round`など）や、TypeScript/webpackのエイリアスパス（`@styles/`、`@components/`など）も自動的にサポートします。<br>
(オプションで、styles[variable] のような動的にアクセスされるクラスは設定により未使用クラス検出から除外できます。)
*   **デザインシステムのカラーチェック:** 使用されている色が事前定義されたデザインシステムパレットからのものであるかを確認します。
*   **数値プロパティの制限:** `z-index`、`font-size`、`width` などの数値 CSS プロパティに制限を適用します。

## 制限事項・注意点

- **コンポーネントベースの使用:** コンポーネント実装内で使用されるクラス（例：`<Icon>`コンポーネントで使用される`&.icon i`）は、実際にブラウザで使用されていても未使用としてフラグが立てられる場合があります。これは静的解析の既知の制限です。
- **動的レンダリング:** 条件付きレンダリングや動的コンポーネントで使用されるクラスは検出されない場合があります。
- **CSS-in-JS:** styled-componentsやCSS-in-JSライブラリで定義されたクラスは現在サポートされていません。
- **誤検知:** リンターは実際に使用されているクラスを未使用としてフラグを立てる場合があります。削除前にフラグが立てられたクラスを手動で確認してください。

## 使用方法

Style Sentryは CSSファイルを開いたり保存したりすると自動的にリンティングを行います。エラーと警告は、エディターの問題パネルに直接、およびインラインの波線として表示されます。

## 設定

- **VSCode拡張機能：**
  - VSCodeの設定UIから直接設定できます。`ファイル > 基本設定 > 設定 > 拡張機能 > Style Sentry` で各種ルール（未使用クラス検出、動的クラス除外など）を変更できます。
  - 拡張機能には `.stylesentryrc.js` ファイルは不要です。

### 例: VSCode設定 (settings.json)
```json
{
  "style-sentry.rules.no-unused-classes.enabled": true,
  "style-sentry.rules.no-unused-classes.ignoreDynamicClasses": true
}
```

## インストール

1.  VS Code を開きます。
2.  拡張機能ビューに移動します (`Ctrl+Shift+X` または `Cmd+Shift+X`)。
3.  「Style Sentry」を検索します。
4.  「インストール」をクリックします。

---

**注意:** この拡張機能には Style Sentry CLI がバンドルされているため、CLI を別途インストールする必要はありません。

---

## Style Sentry for VS Code (한국어)

**Style Sentry**는 Style Sentry CLI 도구를 에디터에 직접 통합하여 팀의 CSS 디자인 시스템 및 코딩 표준을 적용하는 데 도움을 주는 Visual Studio Code 확장 프로그램입니다.

## 기능

*   **실시간 린팅:** 입력하거나 저장할 때 `.css`, `.scss`, `.less` 파일을 자동으로 검사합니다.
*   **미사용 CSS 클래스 검출:** JSX/TSX 파일에서 정의되었지만 사용되지 않는 CSS 클래스를 식별합니다.<br>
`classnames` 라이브러리(`cn`, `classNames`, `clsx`)를 통한 동적 클래스 구성을 완전히 지원합니다.<br>
SCSS의 `@mixin` 내부의 중첩된 클래스(`&.oval`, `&.round` 등)와 TypeScript/webpack의 별칭 경로(`@styles/`, `@components/` 등)도 자동으로 지원합니다.<br>
(옵션) 동적으로 접근되는 클래스(styles[변수])는 설정에 따라 미사용 검사에서 제외할 수 있습니다.
*   **디자인 시스템 색상 검사:** 사용된 색상이 미리 정의된 디자인 시스템 팔레트에서 온 것인지 확인합니다.
*   **숫자 속성 제한:** `z-index`, `font-size`, `width`와 같은 숫자 CSS 속성에 제한을 적용합니다.

## 제한사항 및 주의점

- **컴포넌트 기반 사용:** 컴포넌트 구현 내부에서 사용되는 클래스(예: `<Icon>` 컴포넌트에서 사용되는 `&.icon i`)는 실제로 브라우저에서 사용되고 있어도 미사용으로 표시될 수 있습니다. 이는 정적 분석의 알려진 제한사항입니다.
- **동적 렌더링:** 조건부 렌더링이나 동적 컴포넌트에서 사용되는 클래스는 감지되지 않을 수 있습니다.
- **CSS-in-JS:** styled-components나 CSS-in-JS 라이브러리에서 정의된 클래스는 현재 지원되지 않습니다.
- **오탐:** 린터가 실제로 사용되는 클래스를 미사용으로 표시할 수 있습니다. 제거하기 전에 표시된 클래스를 수동으로 확인해주세요.

## 사용법

Style Sentry는 CSS 파일을 열거나 저장할 때 자동으로 린팅을 수행합니다. 오류 및 경고는 에디터의 문제 패널과 인라인 물결선으로 직접 표시됩니다.

## 설정

- **VSCode 확장 프로그램:**
  - VSCode 설정 UI에서 직접 옵션을 변경할 수 있습니다. `파일 > 기본 설정 > 설정 > 확장 프로그램 > Style Sentry`에서 미사용 클래스 검사, 동적 클래스 제외 등 다양한 규칙을 설정하세요.
  - 확장 프로그램에는 `.stylesentryrc.js` 파일이 필요하지 않습니다.

### 예시: VSCode 설정 (settings.json)
```json
{
  "style-sentry.rules.no-unused-classes.enabled": true,
  "style-sentry.rules.no-unused-classes.ignoreDynamicClasses": true
}
```

## 설치

1.  VS Code를 엽니다.
2.  확장 프로그램 보기로 이동합니다 (`Ctrl+Shift+X` 또는 `Cmd+Shift+X`).
3.  "Style Sentry"를 검색합니다.
4.  "설치"를 클릭합니다.

---

**참고:** 이 확장 프로그램은 Style Sentry CLI를 번들로 제공하므로 CLI를 별도로 설치할 필요가 없습니다.
