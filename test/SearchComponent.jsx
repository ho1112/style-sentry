import React from 'react';
import styles from './search.module.scss';

const SearchComponent = () => {
  return (
    <div className={`${styles.container} ${styles.wrapper}`}>
      <h1 className={styles.title}>Search</h1>
    </div>
  );
};

export default SearchComponent;