import React from 'react';
import './styles.css';
import './styles.scss';
import './styles.less';

export const CssTestComponent = () => {
  return (
    <div>
      {/* CSS 클래스 사용 */}
      <div className="used-class">Used CSS class</div>
      <div className="another-used-class">Another used CSS class</div>
      
      {/* SCSS 클래스 사용 */}
      <div className="scss-used-class">Used SCSS class</div>
      
      {/* LESS 클래스 사용 */}
      <div className="less-used-class">Used LESS class</div>
      
      {/* 미사용 클래스들은 사용하지 않음 */}
      {/* unused-class, scss-unused-class, less-unused-class 등 */}
    </div>
  );
};
