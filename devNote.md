# 2024-05-16 Style Sentry 개발 회고

## 주요 작업 및 개선 사항 요약

### 1. 동적 클래스(dynamically accessed class) 처리 개선
- 기존에는 `styles[category]`와 같이 동적으로 접근되는 클래스가 실제로 사용되는지 알 수 없어, 모든 클래스를 미사용으로 경고하거나, 반대로 모두 사용된 것으로 간주하는 한계가 있었음.
- **개선:**
  - 동적 접근이 감지된 부모 클래스(예: `wrapper`)의 자식 클래스(예: `wrapper.top`)만 "사용된 것"으로 간주하도록 정밀하게 로직을 개선.
  - 동적 접근이 없는 부모의 자식 클래스(예: `usedWrapper.unused`)는 실제로 사용된 경우에만 "사용된 것"으로 간주.
  - SCSS 파싱 시 &.top과 같은 중첩 클래스가 `wrapper.top` 형태로 정확히 매핑되도록 파서 로직을 보완.

### 2. 미사용 클래스 검출 로직 리팩토링
- 부모와 자식 클래스가 동시에 사용된 경우에만 자식도 "사용된 것"으로 간주하도록 로직을 개선.
- 동적 접근 옵션(ignoreDynamicClasses)이 true/false일 때 결과가 명확히 다르게 나오도록 분기 처리.
- 실제로 사용된 클래스만 "사용된 것"으로 간주하는 정적 분석의 한계와, 동적 접근 예외 처리의 현실적 타협점을 문서화.

### 3. 설정 방식의 변화
- **기존:** `.stylesentryrc.js` 파일이 필수였음.
- **변경:**
  - VSCode 확장에서는 `.stylesentryrc.js` 없이 VSCode Settings UI에서 직접 옵션을 제어할 수 있도록 구조를 변경.
  - CLI는 `.stylesentryrc.js`가 있으면 사용, 없으면 기본값 사용.
- README 및 문서에서 설정 방법을 최신 구조에 맞게 전면 수정.

### 4. 문서화 및 다국어 지원
- ignoreDynamicClasses 옵션의 의미와 사용법을 영어, 일본어, 한국어로 각 README에 추가.
- 기능 설명 바로 아래에 동적 클래스 예외 옵션에 대한 한 줄 설명을 각 언어별로 추가.
- VSCode 확장 README에는 실제 Settings UI 스크린샷과 함께, 설정 예시(JSON)와 CLI 예시를 모두 제공.

### 5. 기타 시행착오 및 교훈
- Markdown에서 이미지 캡션은 alt 텍스트가 아니라 별도의 `<p><em>...</em></p>` 등으로 추가해야 한다는 점을 학습.
- 점 표기법(`styles.used-wrapper`)과 대괄호 표기법(`styles['used-wrapper']`)의 차이, 그리고 JS 객체 속성명 규칙에 따른 CSS Modules 사용법을 명확히 정리.
- 실무에서 동적/정적 클래스, 부모-자식 중첩, 옵션별 동작을 모두 완벽하게 구분하는 것이 얼마나 중요한지 체감.

---

## 오늘의 핵심 인사이트
- **정적 분석의 한계**와 **현실적 타협**: 동적 접근이 있는 경우, 실제로 어떤 클래스가 사용되는지 100% 확정할 수 없으므로, 최대한 정밀하게 부모-자식 구조를 추적하되, 완벽한 오탐/누락 방지는 불가능함을 인지.
- **설정의 일원화**: VSCode 확장과 CLI의 설정 방식을 분리하여, 각 환경에 맞는 UX를 제공하는 것이 사용자 경험에 매우 중요함.
- **문서화의 중요성**: 옵션/동작 방식이 바뀔 때마다 README 등 공식 문서를 반드시 최신화해야 혼란을 줄일 수 있음.

---

## 대표 코드/설정 예시

### VSCode Settings 예시
```json
{
  "style-sentry.rules.no-unused-classes.enabled": true,
  "style-sentry.rules.no-unused-classes.ignoreDynamicClasses": true
}
```

### CLI 설정 예시 (.stylesentryrc.js)
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

---

오늘의 작업을 바탕으로 Style Sentry의 동작과 구조, 그리고 실무 적용 시 주의할 점을 명확히 이해할 수 있었음. 앞으로도 주요 변경점과 시행착오를 devNote.md에 기록할 것!

---

## 2024-05-16 추가 작업: classnames 라이브러리 지원

### 6. classnames 라이브러리 완전 지원 구현
- **문제 상황**: 현업 프로젝트에서 `cn(styles.content, styles[status])` 같은 `classnames` 라이브러리 사용 시, 동적 클래스가 제대로 감지되지 않는 문제 발생.
- **원인 분석**: 기존 AST 파싱 로직이 `CallExpression` 노드(함수 호출)를 제대로 처리하지 못했음.
- **해결 과정**:
  1. `cn`, `classNames`, `clsx` 함수 호출을 감지하는 로직 추가
  2. 함수 인자들을 재귀적으로 순회하여 동적/정적 클래스 접근을 모두 파악
  3. 복잡한 패턴 `cn(styles.button, styles[\`button-${size}\`], { [styles.active]: isActive })` 지원
  4. `ignoreDynamicClasses: true`일 때 `classnames` 내부의 동적 접근도 올바르게 무시되도록 수정

### 7. 완벽한 테스트 케이스 구축
- **테스트 파일 생성**: `test/cn-test.jsx`, `test/cn-test.module.scss`
- **다양한 사용 패턴 테스트**:
  - `CnTestComponent`: `cn()` 함수를 사용한 동적 + 정적 혼합 사용
  - `StaticComponent`: `cn()` 함수를 사용한 정적만 사용
  - `DynamicOnlyComponent`: 동적 접근만 사용 (`styles[status]`, `styles[size]`)
  - `MixedComponent`: 정적 + 동적 혼합 사용
  - `UnusedClassesComponent`: 일부 클래스만 사용하고 나머지는 미사용
- **SCSS 클래스 구성**: 사용/미사용 클래스, 중첩 클래스, 동적 접근 대상 클래스들을 모두 포함

### 8. TypeScript 문법 호환성 개선
- **문제**: `cn-test.jsx`에서 TypeScript 문법(`type`, `React.FC<>`) 사용으로 컴파일 에러 발생
- **해결**: JavaScript 문법으로 변환하여 호환성 확보
- **결과**: 모든 테스트 파일이 정상적으로 파싱되고 린팅됨

### 9. 최종 검증 및 결과
- **`ignoreDynamicClasses: true`**: 동적으로 사용되는 클래스들이 모두 무시됨
- **`ignoreDynamicClasses: false`**: 동적으로 사용되는 클래스들도 모두 경고됨
- **classnames 라이브러리**: 모든 사용 패턴에서 올바르게 동작 확인
- **VSCode 확장**: 설정 충돌 문제 해결 후 정상 동작 확인

---

## 추가 작업의 핵심 인사이트
- **실무 라이브러리 지원의 중요성**: `classnames`는 React 생태계에서 매우 널리 사용되는 라이브러리로, 이를 지원하지 않으면 실무 적용이 어려움
- **AST 파싱의 복잡성**: 함수 호출 내부의 동적 접근을 감지하려면 재귀적 순회와 다양한 노드 타입 처리가 필요
- **테스트의 완성도**: 실제 사용 패턴을 모두 포함한 테스트 케이스가 없으면 린터의 정확성을 보장할 수 없음

---

## 최종 완성된 기능 목록
✅ 동적 클래스 처리 (`styles[category]`, `styles[size]`)  
✅ classnames 라이브러리 지원 (`cn()`, `classNames()`, `clsx()`)  
✅ 복잡한 패턴 지원 (`cn(styles.container, styles[status], { [styles.active]: isActive })`)  
✅ 템플릿 리터럴 지원 (`styles[\`button-${size}\`]`)  
✅ CSS 모듈 네이밍 컨벤션 지원 (camelCase, kebab-case, snake_case)  
✅ 중첩 CSS 클래스 처리 (`&.top`, `wrapper.top`)  
✅ VSCode 확장 프로그램 완전 지원  
✅ 완벽한 테스트 케이스 구축  
✅ 다국어 문서화 완료  

**Style Sentry v1.1.0 배포 준비 완료!** 🚀
