<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 이 프로젝트에 대한 추가 메모

- 톤 = "진지한 척하는 웃긴 서비스". 너무 따뜻하면 망함.
- AI 응답 스타일은 [src/lib/prompts.ts](src/lib/prompts.ts)의 `SYSTEM_PROMPT`에서 단일 진실원으로 관리.
- 키 없을 때 mock으로 떨어지는 경로가 데모/스크린샷용임. mock 데이터는 [src/lib/examples.ts](src/lib/examples.ts) 참고.
- 응답은 무조건 JSON 스키마. 일반 텍스트로 떨어지면 `normalize()`가 mock으로 폴백시킴.
