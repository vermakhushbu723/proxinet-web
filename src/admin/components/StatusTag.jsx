import React from 'react';
import { Badge, Tag } from 'antd';

const hex = { default: '#94a3b8' };

export default function StatusTag({ color, children }) {
  return <Tag color={color === 'default' ? undefined : color} className="!m-0">{children}</Tag>;
}

export const StatusDot = ({ color, text }) => <Badge color={hex[color] || color} text={text} />;
