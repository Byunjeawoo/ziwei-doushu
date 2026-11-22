import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import dictionary from './ko.json';

// 계산용 성명·궁명·간지는 원래 키를 유지하고 출력할 때만 한국어로 바꿉니다.
const translations: Record<string, string> = dictionary;
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const terms = Object.keys(translations).sort((a, b) => b.length - a.length);
const matcher = new RegExp(terms.map(escapeRegex).join('|'), 'g');

export function ko(value: string): string {
  if (Object.prototype.hasOwnProperty.call(translations, value)) return translations[value];
  return value.replace(matcher, (term) => translations[term]);
}

// JSX의 동적 텍스트만 번역합니다. 이벤트, 계산 값, 컴포넌트의 데이터 속성은 보존합니다.
export function koNode(value: ReactNode): ReactNode {
  if (typeof value === 'string') return ko(value);
  if (Array.isArray(value)) return value.map(koNode);
  if (isValidElement<{ children?: ReactNode }>(value) && value.props.children !== undefined) {
    return cloneElement(value, undefined, Children.map(value.props.children, koNode));
  }
  return value;
}
