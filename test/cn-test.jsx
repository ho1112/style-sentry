import React from 'react';
import cn from 'classnames';
import styles from './cn-test.module.scss';

export const CnTestComponent = ({ 
  status, 
  isActive = false, 
  size = 'medium' 
}) => {
  return (
    <div className={cn(styles.container, styles[size])}>
      <span className={cn(styles.content, styles[status])} />
      <button 
        className={cn(
          styles.button, 
          styles[`button-${size}`], 
          { [styles.active]: isActive }
        )}
      >
        {status}
      </button>
    </div>
  );
};

// 정적 사용 예시 (동적 접근 없음)
export const StaticComponent = () => {
  return (
    <div className={cn(styles.staticContainer, styles.staticContent)}>
      <p>Static content</p>
    </div>
  );
};

// 동적 접근만 있는 컴포넌트 (정적 접근 없음)
export const DynamicOnlyComponent = ({ status, size }) => {
  return (
    <div className={styles[status]}>
      <span className={styles[size]} />
    </div>
  );
};

// 혼합 사용 컴포넌트 (정적 + 동적)
export const MixedComponent = ({ status, isActive }) => {
  return (
    <div className={cn(styles.container, styles[status])}>
      <span className={cn(styles.content, styles.active)} />
      <button className={cn(styles.button, { [styles.active]: isActive })}>
        Mixed
      </button>
    </div>
  );
};

// 사용되지 않는 클래스들도 포함하는 컴포넌트
export const UnusedClassesComponent = () => {
  return (
    <div>
      {/* 이 컴포넌트는 일부 클래스만 사용하고 나머지는 사용하지 않음 */}
      <div className={styles.container}>Used container</div>
      <span className={styles.content}>Used content</span>
      {/* styles.button, styles.staticContainer, styles.staticContent 등은 사용하지 않음 */}
    </div>
  );
};
