# 자미두수 배반 엔진

[Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu)의 코드와 고전 자료를 복사한 독립 저장소입니다.

- 원본 커밋: `39c0abd3b8dac609975dddfadd4d4e1d3a978deb`
- 원저작자: 紫微研究(자미 연구) / 王多鱼AI(왕둬위 AI)
- 코드 라이선스: [MIT](./LICENSE). 원본 저작권 표시를 보존합니다.
- 고전 원문: 원본에서 Public Domain으로 안내한 `lib/classics/`.

## 제외한 자료

상업적 이용 금지 자료를 제외하기 위해 아래 내용은 가져오지 않았습니다.

- `docs/tianji-ziwei/`: CC BY-NC-SA 4.0 강의 원문 및 이미지.
- `research/nishi-video-reading/`: 별도 제한을 받는 강의 인용문이 섞인 노트·요약·연구 자료. 혼합 자료를 피하기 위해 디렉터리 전체 제외.
- 원본 다국어 README와 `docs/` 업데이트 이미지: 강의 인용·강의 자료 소개를 포함하는 문서와 이미지. 이 README로 대체.
- 원본 Git 이력, 태그, Releases 데이터셋: 제외 자료가 함께 들어오지 않도록 복사하지 않음.

원본의 [데이터 라이선스](./DATASET-LICENSE)는 출처 및 조건 기록을 위해 보존했습니다. 데이터셋 파일은 이 저장소에 포함되지 않습니다.

## 실행

```bash
git clone https://github.com/Byunjeawoo/ziwei-doushu.git
cd ziwei-doushu
npm ci
npm run dev
```

배반과 명반 표시는 브라우저에서 실행됩니다. 원본 공개 버전에는 AI 해석·합반 분석용 백엔드 API, 회원·결제 기능과 상용 해석 데이터베이스가 포함되어 있지 않습니다.

## 검증

```bash
npm run typecheck
npm test
```
## 한국어판

화면 문구, 해설과 고전 본문, 개발 주석, 기여 안내와 이슈 양식을 한국어로 옮겼습니다. 고전 검색에는 한국어 검색어를 사용할 수 있습니다. 대량 해설은 자동 번역을 기반으로 하며 주요 자미두수 용어와 고전 본문 75개 문단을 별도로 검토했습니다.

계산용 별·궁·간지 키, 코드 식별자와 URL은 호환성을 위해 유지합니다. 원본 법적 고지는 보존하고 [MIT 라이선스 한국어 번역](./LICENSE.ko.md)과 [데이터 이용 조건 한국어 번역](./DATASET-LICENSE.ko.md)을 제공합니다.
