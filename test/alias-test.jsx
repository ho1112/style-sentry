import React from 'react';
import styles from '@styles/alias-test.module.scss';

export const AliasTestComponent = () => {
  return (
    <div>
      {/* 사용되는 클래스들 */}
      <div className={styles.aliasedClass}>Used aliased class</div>
      <div className={styles.anotherAliasedClass}>Another used aliased class</div>
      
      {/* unusedAliasedClass는 사용하지 않음 - 경고되어야 함 */}
    </div>
  );
};
