# 데스크톱 Chrome 수동 검증 (약 10분)

**실행 상태: 검증 대기.** 이 문서는 테스트 결과가 아니라 사용자가 실행할 절차입니다. Chrome 버전/네트워크/광고에 따라 더 걸릴 수 있습니다. 45~60초의 `/watch?v=...` 영상 A/B/C를 미리 준비하고 1배속을 사용하세요. 30초 미만 영상과 `/shorts/`는 성찰 테스트에 쓰지 않습니다. 기존 기록은 삭제하지 마세요.

설치는 [README](../README.md#데스크톱-chrome-설치와-설치-확인)를 따릅니다. 설치한 폴더의 `PAUSE-BUILD.json` 커밋과 `dirtyWorktree` 값을 기록합니다. 클라우드 `/workspace/...`는 PC 다운로드 주소가 아닙니다.

| 시간 | 실행 | 확인할 결과 | 현재 결과 |
| --- | --- | --- | --- |
| 0~1분 | 설치 후 popup 열기, PAUSE/종료 성찰 켜기, YouTube 탭 새로고침 | 확장 프로그램 오류 없음, Notes 버튼과 설정 표시 | 검증 대기 |
| 1~2분 | A에서 메모 저장, 타임스탬프 클릭. 별도 초안 입력 후 패널 닫기/열기 및 탭 새로고침 | 저장 목록·시각 이동 정상, 새로고침 후 저장 메모와 완료된 초안 쓰기 복원 | 검증 대기 |
| 2~3분 | 자동재생 끄고 A를 새로고침한 뒤 처음부터 끝까지 재생 | 성찰 한 번, 5초 전 건너뛰기 비활성, 5초 후 기록 없이 닫기 가능 | 검증 대기 |
| 3~4분 | A 새로고침 후 재생. 종료 직전 전체화면으로 전환 | 전체화면에서 성찰 확인. 5초 전에 입력/저장 가능, popup 성찰 수 증가. 화면이 보이지 않으면 실패로 기록하고 전체화면을 나와 복구 | 검증 대기 |
| 4~6분 | 자동재생 켜고 짧은 영상 재생목록에서 B를 끝까지 재생. 성찰 중 다음 영상 전환 여부 확인 후 건너뛰기 | 성찰 중 보이는 video는 정지 시도, 종료 개입 중복 없음. 이미 다음 영상이 시작돼 PAUSE가 정지시켰다면 완료 후 재개 시도. 브라우저 거절 시 수동 재생 | 검증 대기 |
| 6~7분 | C 추천 영상 클릭 → 주소/제목 확인 → 브라우저 뒤로 가기. 홈 → watch도 확인 | 영상별 메모 분리, 버튼 중복 없음, 이전 영상 메모 유지. 의도치 않은 영상 재생/성찰 없음 | 검증 대기 |
| 7~8분 | A 새로고침, 5초만 재생한 뒤 끝부분으로 seek해 종료. 중간 pause/seek도 확인 | 유효 시청 기준 미달이므로 성찰 없음. 같은 탭/영상의 이미 완료된 개입이 재표시되지 않음 | 검증 대기 |
| 8~10분 | 광고가 나온 watch 영상에서 광고 중/후 영상 ID·시간·ended와 개입 여부 관찰. 두 탭 동일 영상 초안도 각각 입력 | 광고 오개입 여부를 기록. 다른 탭 초안의 마지막 저장 우선/유실 위험 확인. 광고 미노출이면 광고 항목은 검증 대기 유지 | 검증 대기 |

자동재생 켬/끔은 사용자가 YouTube에서 직접 변경합니다. PAUSE는 그 설정을 바꾸지 않습니다. 정상 시청과 seek 검증 사이에는 새로고침으로 시청 누적을 초기화하세요. 동일 ID를 새로고침 없이 재시청하면 중복 개입 방지 때문에 성찰이 다시 뜨지 않는 것이 현재 정책입니다.

성찰 중 전체화면 종료나 키보드 등으로 추천 링크에 실제로 접근할 수 있는 경우, 그 링크를 요청한 뒤 성찰 완료 후 해당 URL이 열리는지 확인합니다. 오버레이 뒤 링크를 클릭할 수 없다면 억지로 UI를 우회하지 말고 해당 경로를 미실행으로 기록하세요. jsdom 링크 복원 테스트는 실제 YouTube 전환 검증을 대체하지 않습니다.

## 진단 방법

1. `chrome://extensions`의 PAUSE 카드에서 오류를 확인합니다. popup 문제는 popup 우클릭 → 검사로 Console을 엽니다. YouTube 문제는 해당 탭 개발자 도구 Console에서 발생 시각과 오류 문구를 기록합니다.
2. YouTube Console에서 다음 **읽기 전용** 요약으로 video 교체/광고 상태를 관찰할 수 있습니다. 광고 클래스는 진단 힌트이며 광고를 확정 판정하지 않습니다. 영상 ID나 개인 기록은 출력하지 않습니다.

```js
(() => {
  const v = document.querySelector('video.html5-main-video') || document.querySelector('video');
  return {
    page: location.pathname,
    videoCount: document.querySelectorAll('video').length,
    currentTime: v?.currentTime,
    duration: v?.duration,
    paused: v?.paused,
    ended: v?.ended,
    seeking: v?.seeking,
    playbackRate: v?.playbackRate,
    adClassHint: !!document.querySelector('#movie_player.ad-showing'),
    fullscreen: !!document.fullscreenElement,
    pauseHostCount: document.querySelectorAll('#pause-extension').length
  };
})()
```

3. 메모가 보이지 않으면 popup 검사 Console(확장 프로그램 실행 컨텍스트)에서 아래 요약으로 **개수만** 확인합니다. 웹페이지의 기본 Console에는 chrome.storage 권한이 없습니다. 저장 키 전체, 메모, 쿠키, 토큰, 인증 헤더는 복사하지 마세요.

```js
chrome.storage.local.get(null).then(rows => {
  const counts = {video: 0, note: 0, reflection: 0, draft: 0};
  for (const key of Object.keys(rows)) {
    if (!key.startsWith('pause:v1:')) continue;
    const kind = key.split(':')[2];
    if (Object.hasOwn(counts, kind)) counts[kind]++;
  }
  console.table(counts);
});
```

4. 같은 페이지에서 `pauseHostCount > 1`이면 중복 로드 가능성을 기록합니다. 업데이트 후 확장 프로그램과 YouTube 탭을 모두 새로고침하고 재현하세요. 저장 장애가 나면 내용을 먼저 복사해 보관하세요. 확장 프로그램 삭제나 storage.clear로 진단하지 마세요.

## ANIM-001 추천 목록 연쇄 모션 확인

창 너비 1000px 이상, OS 애니메이션 효과 켜짐 상태에서 확인합니다.

1. Notes 열기: 맨 위 추천 카드부터 약 30ms 간격으로 아래 카드까지 차례로 내려가며 각각 약 4px 튕긴 뒤 안착하는지 확인합니다.
2. Notes 닫기: 맨 아래 보이는 카드부터 역순으로 올라오고, 메모 카드는 그 위에서 사라지는지 확인합니다.
3. 빠르게 여러 번 열고 닫기: 카드가 순간이동하거나 겹친 채 멈추지 않는지 확인합니다.
4. 모션 도중 창 크기 변경, 다른 추천 영상 클릭(SPA 이동), 페이지를 조금 스크롤한 상태에서 열기/닫기를 해 봅니다. 모션이 끝난 뒤 카드 위치·클릭·스크롤이 평소와 같아야 합니다.
5. 재생목록·실시간 채팅·광고 카드가 있는 영상에서도 1~4를 확인합니다. 카드를 찾지 못하면 기존 높이 애니메이션으로 열리는 것이 정상입니다.
6. Windows '애니메이션 효과'를 끄면(reduced-motion) 카드 이동 없이 짧은 페이드만 보여야 합니다.
7. 모션이 보이지 않으면 PAUSE 팝업에서 진단 로그를 켠 뒤 YouTube 탭 Console의 `[PAUSE diagnostic]` `list-cascade` 줄을 확인합니다. `targets=…moved=…`(연쇄 실행), `fallback=height`(카드 탐색 실패), `fallback=reduced-motion` 중 무엇이 찍히는지 기록합니다.
8. 전체화면에서 PAUSE 버튼으로 Notes를 열고 닫습니다. 카드가 오른쪽 화면 밖에서 페이드와 함께 밀고 들어오고, 닫을 때 오른쪽으로 밀려 나가야 합니다. 빠르게 여러 번 눌러도 카드가 한 장만 남아야 합니다.
9. 영상 종료 성찰 화면에서 배경이 살짝 어두워지며 흐려지고, 카드가 아래에서 페이드와 함께 올라오는지 확인합니다. 기록 또는 건너뛰기 후 카드가 아래로 내려가며 사라지고 배경 흐림도 함께 풀려야 합니다. 전체화면에서도 확인합니다.
10. reduced-motion 환경에서는 8·9번 모두 이동 없이 짧은 페이드만 보여야 합니다.

## 결과 기록 양식

실제로 실행한 항목만 통과/실패로 바꾸고 나머지는 검증 대기로 둡니다. 기대와 다른 동작은 Console 오류가 없어도 실패입니다.

```text
검증 시각 / OS / Chrome 버전:
빌드 커밋 / dirtyWorktree:
영상 A/B/C 길이 / 배속:
로그인 여부(계정명 제외) / 광고 관찰 여부:
자동재생 상태 / 재생목록 여부:
검증 항목:
실행 여부: 실행 / 미실행
결과: 통과 / 실패 / 검증 대기
재현 순서:
기대 동작:
실제 동작:
오류 문구(인증·개인 내용 제외):
```
