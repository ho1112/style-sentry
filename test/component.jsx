import React, { useState } from 'react';
import styles from './common.module.scss';

// 동적 접근 케이스
const categories = ['top', 'bottom'];

const DynamicComponent = ({ category }) => (
  <div className={styles.wrapper + ' ' + styles[category]}>
    <p>Dynamic: {category}</p>
  </div>
);

// 정적 접근만 사용하는 케이스
const StaticComponent = () => (
  <div className={styles.wrapper}>
    <p>Static only</p>
  </div>
);

// used-wrapper 테스트 케이스
const UsedWrapperComponent = () => (
  <>
    {/* .used-wrapper만 사용 */}
    <div className={styles.usedWrapper}>used-wrapper only</div>
    {/* .used-wrapper.used 사용 */}
    <div className={`${styles.usedWrapper} ${styles.used}`}>used-wrapper used</div>
    {/* .used-wrapper.unused는 사용하지 않음 */}
  </>
);

const Component = () => {
  const [category] = useState('top');
  return (
    <>
      <DynamicComponent category={category} />
      <StaticComponent />
      <UsedWrapperComponent />
    </>
  );
};

export default Component;