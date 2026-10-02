/**
 * 와트 업무 문의 접수기 (Google Apps Script)
 * - wattscience.github.io/inquiry.html 에서 보낸 문의를 받아
 *   1) 이 스프레드시트에 한 줄씩 기록하고
 *   2) 와트에게 알림 메일을 보내고
 *   3) (선택) 문의자에게 접수 확인 메일을 보냅니다.
 */

// ===== 설정 =====
const NOTIFY_EMAIL = 'scientistwatt@gmail.com'; // 알림 받을 주소
const SEND_AUTO_REPLY = true;                   // 문의자에게 접수 확인 메일 보내기
const SHEET_NAME = '문의';

const FIELDS = [
  ['name', '이름'],
  ['org', '소속·기관'],
  ['email', '이메일'],
  ['phone', '연락처'],
  ['type', '문의 유형'],
  ['date', '희망 일정'],
  ['audience', '대상·규모'],
  ['place', '장소'],
  ['budget', '예산'],
  ['message', '문의 내용'],
];

// 문의 페이지(inquiry.html)가 보낸 내용을 받는 입구
function doPost(e) {
  var result = submitInquiry((e && e.parameter) || {});
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// 주소를 브라우저로 직접 열었을 때 보이는 안내
function doGet() {
  return ContentService.createTextOutput('와트 업무 문의 접수기가 작동 중입니다.');
}

function submitInquiry(form) {
  form = form || {};

  // 스팸 방지용 숨은 칸이 채워져 있으면 조용히 무시
  if (form.website) return { ok: true };

  const clean = {};
  FIELDS.forEach(([key]) => {
    clean[key] = String(form[key] || '').trim().slice(0, 4000);
  });

  const required = ['name', 'org', 'email', 'type', 'message'];
  const missing = required.filter((k) => !clean[k]);
  if (missing.length) {
    return { ok: false, error: '필수 항목을 모두 입력해 주세요.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) {
    return { ok: false, error: '이메일 주소 형식을 확인해 주세요.' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    sheet.appendRow([new Date()].concat(FIELDS.map(([k]) => clean[k])));
  } finally {
    lock.releaseLock();
  }

  // 와트에게 알림
  const rows = FIELDS
    .filter(([k]) => clean[k])
    .map(([k, label]) =>
      '<tr><td style="padding:6px 14px 6px 0;color:#666;white-space:nowrap;vertical-align:top">' +
      label + '</td><td style="padding:6px 0">' +
      escape_(clean[k]).replace(/\n/g, '<br>') + '</td></tr>')
    .join('');

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: clean.email,
    name: '와트 업무 문의',
    subject: '[업무 문의] ' + clean.org + ' · ' + clean.type + ' (' + clean.name + ')',
    htmlBody:
      '<div style="font-family:sans-serif;font-size:15px;line-height:1.6">' +
      '<p>새 업무 문의가 도착했어요. 이 메일에 바로 답장하면 문의자에게 전달됩니다.</p>' +
      '<table style="border-collapse:collapse">' + rows + '</table>' +
      '<p style="color:#888;font-size:13px">전체 기록: ' +
      SpreadsheetApp.getActiveSpreadsheet().getUrl() + '</p></div>',
  });

  // 문의자에게 접수 확인
  if (SEND_AUTO_REPLY) {
    MailApp.sendEmail({
      to: clean.email,
      replyTo: NOTIFY_EMAIL,
      name: '과학커뮤니케이터 와트',
      subject: '[와트] 문의가 잘 접수되었습니다',
      htmlBody:
        '<div style="font-family:sans-serif;font-size:15px;line-height:1.7">' +
        '<p>' + escape_(clean.name) + '님, 안녕하세요. 과학커뮤니케이터 와트입니다.</p>' +
        '<p>보내주신 문의(' + escape_(clean.type) + ')를 잘 받았습니다. ' +
        '내용 확인 후 남겨주신 연락처로 회신드리겠습니다.</p>' +
        '<p>추가로 전하실 내용이 있으면 이 메일에 답장해 주세요.</p>' +
        '<p>와트 드림</p></div>',
    });
  }

  return { ok: true };
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['접수 시각'].concat(FIELDS.map(([, label]) => label)));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, FIELDS.length + 1).setFontWeight('bold');
  }
  return sheet;
}

function escape_(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 설정 직후 한 번 실행해서 권한을 승인하고 메일이 오는지 확인하는 용도
function testNotification() {
  submitInquiry({
    name: '테스트',
    org: '테스트 기관',
    email: NOTIFY_EMAIL,
    type: '강연',
    message: '알림이 잘 오는지 확인하는 테스트 문의입니다.',
  });
}
