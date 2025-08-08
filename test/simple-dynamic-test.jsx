import React from 'react';
import styles from './cn-test.module.scss';

type StatusType = 'public' | 'review' | 'draft' | 'close';

export const SimpleDynamicTest: React.FC<{ status: StatusType }> = ({ status }) => {
  return (
    <div>
      {/* 직접 동적 접근 - 이건 감지되어야 함 */}
      <span className={`${styles.content} ${styles[status]}`} />
      
      {/* 템플릿 리터럴 동적 접근 */}
      <span className={`${styles.content} ${styles[`content-${status}`]}`} />
    </div>
  );
};
