import React from 'react';
import cn from 'classnames';
import styles from './button-test.module.scss';

export const ButtonTestComponent = ({ shape = 'oval', isLoading = false, alert = false }) => {
  return (
    <div>
      {/* Primary button with dynamic shape */}
      <button
        className={cn(styles.primary, styles[shape], {
          [styles.isLoading]: isLoading,
          [styles.alert]: alert,
        })}
      >
        Primary Button
      </button>

      {/* Secondary button with dynamic shape */}
      <button
        className={cn(styles.secondary, styles[shape], {
          [styles.isLoading]: isLoading,
        })}
      >
        Secondary Button
      </button>

      {/* Circle button with dynamic shape */}
      <button className={cn(styles.circle, styles[shape])}>
        Circle Button
      </button>
    </div>
  );
};
