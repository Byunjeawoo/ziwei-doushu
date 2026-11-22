/* *
 * 사이트 루트 주소. 배포 중에 .env.local에서 NEXT_PUBLIC_SITE_URL을 구성합니다(.env.example 참조).
 * 포크 배포 후 사이트맵과 정식이 다른 사람의 도메인 이름을 가리키는 것을 방지하려면 구성되지 않은 경우 로컬 개발 주소를 사용하세요. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

/* * 인터페이스에 표시할 도메인 이름 부분(예: 공유 카드 하단)만 사용하세요. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');
