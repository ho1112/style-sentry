# Style Sentry for VS Code

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
*   **Unused CSS Class Detection:** Identifies CSS classes defined but not used in your JSX/TSX files.
*   **Design System Color Check:** Verifies if colors used are from your predefined design system palette.
*   **Numeric Property Limits:** Enforces limits on numeric CSS properties like `z-index`, `font-size`, and `width`.

## Getting Started

To use the Style Sentry VS Code extension, you need a `.stylesentryrc.js` configuration file in the root of your project. This file defines your design system rules.

**How to create the configuration file:**

1.  Open your project in a terminal.
2.  Run the following command:

    ```bash
    npx style-sentry init
    ```

    This command will generate a `.stylesentryrc.js` file with a basic configuration in your project's root directory.

## Usage

Once the extension is installed and you have a `.stylesentryrc.js` file in your project root, Style Sentry will automatically lint your CSS files when you open or save them. Errors and warnings will be displayed directly in the editor's problem panel and as inline squiggles.

## Configuration

Style Sentry's behavior is entirely controlled by the `.stylesentryrc.js` file in your project root. Refer to the [Style Sentry CLI documentation](https://github.com/ho1112/style-sentry.git#configuration) for detailed information on how to configure rules.

You can also find the Style Sentry CLI package on [npm](https://www.npmjs.com/package/style-sentry).

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
*   **未使用のCSSクラスの検出:** JSX/TSX ファイルで定義されているが使用されていない CSS クラスを識別します。
*   **デザインシステムのカラーチェック:** 使用されている色が事前定義されたデザインシステムパレットからのものであるかを確認します。
*   **数値プロパティの制限:** `z-index`、`font-size`、`width` などの数値 CSS プロパティに制限を適用します。

## はじめに

Style Sentry VS Code 拡張機能を使用するには、プロジェクトのルートに `.stylesentryrc.js` 設定ファイルが必要です。このファイルは、デザインシステムルールを定義します。

**設定ファイルの作成方法:**

1.  ターミナルでプロジェクトを開きます。
2.  次のコマンドを実行します:

    ```bash
    npx style-sentry init
    ```

    このコマンドは、プロジェクトのルートディレクトリに基本的な設定を持つ `.stylesentryrc.js` ファイルを生成します。

## 使用方法

拡張機能がインストールされ、プロジェクトのルートに `.stylesentryrc.js` ファイルがある場合、Style Sentry は CSS ファイルを開いたり保存したりすると自動的にリンティングを行います。エラーと警告は、エディターの問題パネルに直接、およびインラインの波線として表示されます。

## 設定

Style Sentry の動作は、プロジェクトのルートにある `.stylesentryrc.js` ファイルによって完全に制御されます。ルールの設定方法の詳細については、[Style Sentry CLI ドキュメント](https://github.com/ho1112/style-sentry.git#configuration)を参照してください。

[npm](https://www.npmjs.com/package/style-sentry)でStyle Sentry CLIパッケージも見つけることができます。

## インストール

1.  VS Code を開きます。
2.  拡張機能ビューに移動します (`Ctrl+Shift+X` または `Cmd+Shift+X`)。
3.  「Style Sentry」を検索します。
4.  「インストール」をクリックします。

---

**注:** この拡張機能には Style Sentry CLI がバンドルされているため、CLI を別途インストールする必要はありません。

---

## Style Sentry for VS Code (한국어)

**Style Sentry**는 Style Sentry CLI 도구를 에디터에 직접 통합하여 팀의 CSS 디자인 시스템 및 코딩 표준을 적용하는 데 도움을 주는 Visual Studio Code 확장 프로그램입니다.

## 기능

*   **실시간 린팅:** 입력하거나 저장할 때 `.css`, `.scss`, `.less` 파일을 자동으로 검사합니다.
*   **미사용 CSS 클래스 검출:** JSX/TSX 파일에서 정의되었지만 사용되지 않는 CSS 클래스를 식별합니다.
*   **디자인 시스템 색상 검사:** 사용된 색상이 미리 정의된 디자인 시스템 팔레트에서 온 것인지 확인합니다.
*   **숫자 속성 제한:** `z-index`, `font-size`, `width`와 같은 숫자 CSS 속성에 제한을 적용합니다.

## 시작하기

Style Sentry VS Code 확장 프로그램을 사용하려면 프로젝트 루트에 `.stylesentryrc.js` 설정 파일이 필요합니다. 이 파일은 디자인 시스템 규칙을 정의합니다.

**설정 파일 생성 방법:**

1.  터미널에서 프로젝트를 엽니다.
2.  다음 명령어를 실행합니다:

    ```bash
    npx style-sentry init
    ```

    이 명령어는 프로젝트의 루트 디렉토리에 기본 설정이 포함된 `.stylesentryrc.js` 파일을 생성합니다.

## 사용법

확장 프로그램이 설치되고 프로젝트 루트에 `.stylesentryrc.js` 파일이 있으면, Style Sentry는 CSS 파일을 열거나 저장할 때 자동으로 린팅을 수행합니다. 오류 및 경고는 에디터의 문제 패널과 인라인 물결선으로 직접 표시됩니다.

## 설정

Style Sentry의 동작은 프로젝트 루트의 `.stylesentryrc.js` 파일에 의해 전적으로 제어됩니다. 규칙 구성 방법에 대한 자세한 내용은 [Style Sentry CLI 문서](https://github.com/ho1112/style-sentry.git#configuration)를 참조하십시오.

[npm](https://www.npmjs.com/package/style-sentry)에서 Style Sentry CLI 패키지도 찾을 수 있습니다.

## 설치

1.  VS Code를 엽니다.
2.  확장 프로그램 보기로 이동합니다 (`Ctrl+Shift+X` 또는 `Cmd+Shift+X`).
3.  "Style Sentry"를 검색합니다.
4.  "설치"를 클릭합니다.

---

**참고:** 이 확장 프로그램은 Style Sentry CLI를 번들로 제공하므로 CLI를 별도로 설치할 필요가 없습니다.
