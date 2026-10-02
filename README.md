# 과학커뮤니케이터 와트 · 강사 페이지

발행 주소: https://wattscience.github.io

## 폴더 구성
- `index.html` : 페이지 본체
- `assets/` : 사진, 전구 이미지, 영상, 공유 미리보기 이미지(og.jpg)
- `favicon.png`, `favicon.ico`, `apple-touch-icon.png` : 브라우저 탭·홈 화면 아이콘
- `.nojekyll` : GitHub이 파일을 그대로 보여주도록 하는 설정 파일 (지우지 마세요)

## 처음 올리기
1. GitHub 조직 `wattscience` 안에 공개(Public) 저장소 `wattscience.github.io` 만들기
2. 저장소 화면 → Add file → Upload files
3. 이 폴더 안의 모든 파일과 `assets` 폴더를 통째로 끌어다 놓기 → Commit changes
4. Settings → Pages → Source: Deploy from a branch / Branch: main, (root) → Save
5. 1~2분 뒤 https://wattscience.github.io 접속

## 업무 문의 버튼을 문의 페이지로 바꾸기 (나중에)
지금은 "문의서 작성하기" 버튼을 누르면 문의 양식이 채워진 이메일 창이 열립니다.
문의 페이지를 만든 뒤에는 `index.html`에서 `id="inquiry-link"`가 있는 줄의
`href="mailto:..."` 부분을 문의 페이지 주소로 바꾸고 `target="_blank"`를 추가하세요.

## 수정 후 다시 올리기
바뀐 파일만 같은 방법(Upload files)으로 올리면 덮어써집니다. 1~2분 뒤 반영됩니다.
