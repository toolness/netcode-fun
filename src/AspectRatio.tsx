import React from 'react';

export const AspectRatio: React.FC<{
  width: number,
  height: number,
} & React.HTMLAttributes<HTMLDivElement>> = props => {
  const {width, height, style, ...divProps} = props;

  return <div style={{
    ...style,
    height: 0,
    paddingTop: `${height / width * 100}%`
  }} {...divProps}/>;
};
