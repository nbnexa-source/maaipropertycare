/* eslint-disable */
// Single MAAI enquiry form. Same fields and payload as the old Apps Script Buyer/Seller forms,
// sent in the background to the merged Apps Script doPost (Master Leads sheet, L-#### IDs, lead folders).
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbwC2nCU6VZld6zKUeYpvVJsWUrgIk-m6HPu7MqkJsCdFajxNKtvoXkvZNlqAR48w4weRw/exec';   // merged Apps Script /exec URL

var MODE = '';   // '' until chosen, then 'buyer' or 'seller'
var ROOM_SLOTS = [
  ['drawing-room','Drawing room'],['master-bedroom','Master bedroom'],['bedroom-2','Bedroom 2'],['bedroom-3','Bedroom 3'],
  ['kitchen','Kitchen'],['bathroom-1','Bathroom 1'],['bathroom-2','Bathroom 2'],['balcony','Balcony'],
  ['building-society','Building / Society'],['other','Other'],['walkthrough-video','Walkthrough video']
];
var ALL_SLOTS = [['general','All photos & videos']].concat(ROOM_SLOTS);
var MAX_IMG = 10 * 1024 * 1024, MAX_VID = 40 * 1024 * 1024, MAX_EDGE = 2000;
var picked = {};   // slot key -> [File]

function $(id) { return document.getElementById(id); }
function mb(n) { return (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + ' MB'; }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function isVideo(f) { return /^video\//.test(f.type) || /\.(mp4|mov|m4v|3gp|webm|mkv)$/i.test(f.name); }
function isImage(f) { return /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name); }

var WANT = { 'Buy': ['buyer', 'intentB', 'Buy'], 'Take on Rent': ['buyer', 'intentB', 'Rent'],
  'Sell': ['seller', 'intentS', 'Sell'], 'Give on Rent': ['seller', 'intentS', 'Give on rent'] };
var TEXT = {
  buyer: { title: 'Buy or Rent', proj: 'Preferred project / society', ph: 'e.g. Proxima 2, or tap Any', sec2: 'What are you looking for?', last: '4' },
  seller: { title: 'Sell or Give on Rent', proj: 'Project / society name', ph: 'e.g. Signature Global Proxima', sec2: 'Your property', last: '6' }
};
var slotsBuilt = false;
// Shows only the fields of the chosen form (the old Buyer or Seller form) and sets its hidden 'I want to' value.
function applyMode() {
  var w = WANT[radio('want')];
  if (!w) { $('rest').hidden = true; return; }
  MODE = w[0];
  var r = document.querySelector('input[name="' + w[1] + '"][value="' + w[2] + '"]'); if (r) r.checked = true;
  [].slice.call(document.querySelectorAll('.only')).forEach(function (el) {
    var on = (el.getAttribute('data-only') || '').split(' ').indexOf(MODE) >= 0;
    el.classList.toggle('only', !on);
  });
  var t = TEXT[MODE];
  $('projLabel').textContent = t.proj; $('project').placeholder = t.ph;
  $('sec2').textContent = t.sec2; $('lastNum').textContent = t.last;
  if (MODE === 'seller' && !slotsBuilt) { buildSlots(); slotsBuilt = true; }
  buyerConditional();
  $('rest').hidden = false;
  setInvalid('want', false);
}

// Family/bachelors only for Rent, home loan only for Buy.
function buyerConditional() {
  var v = radio('intentB');
  $('familyWrap').hidden = v !== 'Rent';
  $('loanWrap').hidden = v !== 'Buy';
}

function buildSlots() {
  var html = '';
  ROOM_SLOTS.forEach(function (s) {
    var vid = s[0] === 'walkthrough-video';
    html += '<div class="slot' + (vid ? ' video' : '') + '"><div class="slot-h"><b>' + s[1] + '</b>' +
      '<button type="button" class="add" data-k="' + s[0] + '">+ Add ' + (vid ? 'video' : 'files') + '</button></div>' +
      '<input type="file" id="in-' + s[0] + '" multiple accept="' + (vid ? 'video/*' : 'image/*,video/*') + '">' +
      '<ul class="files" id="list-' + s[0] + '"></ul></div>';
  });
  $('slots').innerHTML = html;
  ALL_SLOTS.forEach(function (s) {
    var k = s[0]; picked[k] = [];
    var btn = k === 'general' ? $('addGeneral') : document.querySelector('.add[data-k="' + k + '"]');
    btn.onclick = function () { $('in-' + k).click(); };
    $('in-' + k).onchange = function (e) { addFiles(k, e.target.files); e.target.value = ''; };
  });
}

function addFiles(k, files) {
  var msgs = [];
  [].slice.call(files).forEach(function (f) {
    var vid = isVideo(f), img = !vid && isImage(f);
    if (k === 'walkthrough-video' && !vid) { msgs.push(f.name + ': please choose a video for this slot.'); return; }
    if (!vid && !img) { msgs.push(f.name + ': only photos and videos can be added.'); return; }
    if (img && f.size > MAX_IMG) { msgs.push(f.name + ' is ' + mb(f.size) + '. Photos must be under 10 MB, please choose a smaller photo.'); return; }
    if (vid && f.size > MAX_VID) { msgs.push(f.name + ' is ' + mb(f.size) + '. Videos must be under 40 MB. Please trim it or send it to us on WhatsApp at +91 75894 90641.'); return; }
    picked[k].push(f);
  });
  var w = $('fileWarn');
  w.style.display = msgs.length ? 'block' : 'none';
  w.innerHTML = msgs.map(esc).join('<br>');
  renderList(k);
}

function renderList(k) {
  $('list-' + k).innerHTML = picked[k].map(function (f, i) {
    return '<li><span class="nm">' + esc(f.name) + '</span><span>' + mb(f.size) + '</span><button type="button" aria-label="Remove" data-i="' + i + '">×</button></li>';
  }).join('');
  [].slice.call($('list-' + k).querySelectorAll('button')).forEach(function (b) {
    b.onclick = function () { picked[k].splice(+b.getAttribute('data-i'), 1); renderList(k); };
  });
}

function val(id) { var el = $(id); return el ? el.value.trim() : ''; }
function radio(n) { var r = document.querySelector('input[name="' + n + '"]:checked'); return r ? r.value : ''; }
function digits(s) { return String(s).replace(/\D/g, ''); }
function setInvalid(key, bad) { var el = document.querySelector('[data-req="' + key + '"],[data-chk="' + key + '"]'); if (el) el.classList.toggle('invalid', bad); return bad; }

function validate() {
  var bad = [];
  if (setInvalid('want', !WANT[radio('want')])) { bad.push('wantCard'); return bad; }
  if (setInvalid('name', !val('name'))) bad.push('name');
  var wa = digits(val('whatsapp'));
  if (setInvalid('whatsapp', wa.length < 10 || wa.length > 15)) bad.push('whatsapp');
  if (setInvalid('project', !val('project'))) bad.push('project');
  var mo = MODE === 'buyer' ? digits(val('mobile')) : '';
  if (setInvalid('mobile', !!mo && (mo.length < 10 || mo.length > 15))) bad.push('mobile');
  var al = MODE === 'seller' ? digits(val('altnum')) : '';
  if (setInvalid('altnum', !!al && (al.length < 10 || al.length > 15))) bad.push('altnum');
  [MODE === 'buyer' ? 'email' : 'emailS'].forEach(function (k) {
    var em = val(k);
    if (setInvalid(k, !!em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))) bad.push(k);
  });
  return bad;
}

// Background POST to the Apps Script web app. text/plain = "simple" request, so no CORS preflight.
async function api(body) {
  var r;
  try {
    r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow' });
  } catch (e) { throw 'Could not reach our server. Please check your internet connection.'; }
  var j; try { j = await r.json(); } catch (e) { throw 'Unexpected reply from our server.'; }
  if (!j || !j.ok) throw (j && j.error) || 'Unknown error.';
  return j;
}
function run(fn) {
  var a = [].slice.call(arguments, 1);
  if (fn === 'submitEnquiry') return api({ action: 'submit', data: a[0] });
  if (fn === 'startUpload') return api({ action: 'startUpload', token: a[0], room: a[1], name: a[2], mime: a[3], size: a[4] });
  if (fn === 'uploadChunk') return api({ action: 'uploadChunk', token: a[0], uploadId: a[1], offset: a[2], b64: a[3] });
  return Promise.reject('Unknown request.');
}

// Resize photos to about 2000 px on the long edge (JPEG). Falls back to the original if the browser cannot decode it.
function compress(f) {
  return new Promise(function (resolve) {
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return resolve(f);
    var url = URL.createObjectURL(f), img = new Image();
    img.onload = function () {
      var w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, MAX_EDGE / Math.max(w, h));
      if (s === 1 && f.size < 1.5 * 1048576) { URL.revokeObjectURL(url); return resolve(f); }
      var c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s);
      var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(function (b) {
        URL.revokeObjectURL(url);
        if (!b || b.size >= f.size) return resolve(f);
        resolve(new File([b], f.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.85);
    };
    img.onerror = function () { URL.revokeObjectURL(url); resolve(f); };
    img.src = url;
  });
}

function b64(blob) {
  return new Promise(function (res, rej) {
    var r = new FileReader();
    r.onload = function () { res(String(r.result).split(',')[1] || ''); };
    r.onerror = function () { rej('Could not read the file.'); };
    r.readAsDataURL(blob);
  });
}

function mimeOf(f) {
  if (f.type) return f.type;
  var m = (f.name.match(/\.([a-z0-9]+)$/i) || [])[1] || '';
  return ({ mov: 'video/quicktime', mp4: 'video/mp4', m4v: 'video/mp4', '3gp': 'video/3gpp', webm: 'video/webm', heic: 'image/heic', heif: 'image/heif', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' })[m.toLowerCase()] || 'application/octet-stream';
}

async function uploadAll(token) {
  var queue = [];
  ALL_SLOTS.forEach(function (s) { (picked[s[0]] || []).forEach(function (f) { queue.push({ k: s[0], label: s[1], f: f }); }); });
  if (!queue.length) return [];
  $('f').style.display = 'none'; $('progress').style.display = 'block';
  window.scrollTo(0, 0);
  var failed = [], totalBytes = queue.reduce(function (a, q) { return a + q.f.size; }, 0), doneBytes = 0;
  for (var i = 0; i < queue.length; i++) {
    var q = queue[i], startDone = doneBytes;
    $('progText').textContent = 'File ' + (i + 1) + ' of ' + queue.length + ' · ' + q.label;
    try {
      var file = isImage(q.f) && !isVideo(q.f) ? await compress(q.f) : q.f;
      var scaleTo = q.f.size / file.size;   // progress counts original bytes
      var st = await run('startUpload', token, q.k, file.name, mimeOf(file), file.size);
      var off = 0;
      while (off < file.size) {
        var end = Math.min(off + st.chunkSize, file.size);
        await run('uploadChunk', token, st.uploadId, off, await b64(file.slice(off, end)));
        off = end;
        doneBytes = startDone + off * scaleTo;
        $('barFill').style.width = Math.min(100, Math.round(doneBytes / totalBytes * 100)) + '%';
      }
    } catch (e) {
      failed.push(q.f.name);
    }
    doneBytes = startDone + q.f.size;
    $('barFill').style.width = Math.min(100, Math.round(doneBytes / totalBytes * 100)) + '%';
  }
  return failed;
}

async function onSubmit(e) {
  e.preventDefault();
  var bad = validate(), errEl = $('formErr');
  if (bad.length) {
    errEl.textContent = 'Please fill in the highlighted fields.'; errEl.style.display = 'block';
    var first = $(bad[0]); if (first) { first.focus(); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    return;
  }
  errEl.style.display = 'none';
  var btn = $('btn'); btn.disabled = true; btn.textContent = 'Sending… please wait';
  var buyer = MODE === 'buyer';
  var d = buyer ? {
    form: 'buyer', website: val('website'), name: val('name'), whatsapp: val('whatsapp'), mobile: val('mobile'), email: val('email'),
    project: val('project'), intent: radio('intentB'), propertyType: radio('propertyType'), sector: val('sector'), bhk: radio('bhk'),
    budget: val('budgetB'), furnishing: radio('furnishingB'), facing: val('facingB'),
    area: val('areaB'), areaUnit: val('areaUnitB'), areaType: radio('areaTypeB'), balconyIncl: radio('balconyInclB'),
    family: radio('intentB') === 'Rent' ? radio('family') : '', loan: radio('intentB') === 'Buy' ? radio('loan') : '',
    timeline: radio('timeline'), details: val('details'), bestTime: radio('bestTime'), consent: $('consent').checked
  } : {
    form: 'seller', website: val('website'), name: val('name'), whatsapp: val('whatsapp'), altNumber: val('altnum'), email: val('emailS'),
    project: val('project'), intent: radio('intentS'), propertyType: radio('propertyType'), sector: val('sector'), bhk: radio('bhk'),
    budget: val('budgetS'), timeline: radio('timelineS'), currentStatus: radio('status'), keys: radio('keys'),
    furnishing: radio('furnishingS'), towerFloor: val('towerFloor'), totalFloors: val('totalFloors'), facing: val('facingS'),
    area: val('areaS'), areaUnit: val('areaUnitS'), areaType: radio('areaTypeS'), balconyIncl: radio('balconyInclS'),
    balconies: val('balconies'), balconyArea: val('balconyArea'), details: val('details'), bestTime: radio('bestTime'),
    consent: $('consent').checked
  };
  var res;
  try { res = await run('submitEnquiry', d); }
  catch (err) {
    btn.disabled = false; btn.textContent = 'Submit enquiry';
    errEl.textContent = 'Sorry, something went wrong: ' + err + ' Please try again, or WhatsApp us at +91 75894 90641.';
    errEl.style.display = 'block';
    $('sendErrMsg').textContent = String(err);
    $('f').style.display = 'none'; $('sendErr').style.display = 'block'; window.scrollTo(0, 0);
    return;
  }
  var failed = (MODE === 'seller' && res && res.token) ? await uploadAll(res.token) : [];
  $('f').style.display = 'none'; $('progress').style.display = 'none'; $('thanks').style.display = 'block';
  if (failed.length) {
    $('failNote').textContent = 'Some files could not be uploaded (' + failed.join(', ') + '). You can send them to us on WhatsApp at +91 75894 90641.';
    $('failNote').style.display = 'block';
  }
  if (res && res.leadId) $('ref').textContent = 'Your reference: ' + res.leadId;
  if (res && res.leadId && res.code) {
    var vmsg = 'Hi MAAI Property Care, please verify my enquiry. Ref: ' + res.leadId + ', Code: ' + res.code;
    $('verifyBtn').href = 'https://wa.me/917589490641?text=' + encodeURIComponent(vmsg);
    $('verify').style.display = 'block';
  }
  window.scrollTo(0, 0);
}

[].slice.call(document.querySelectorAll('input[name="want"]')).forEach(function (r) { r.addEventListener('change', applyMode); });
[].slice.call(document.querySelectorAll('input[name="intentB"]')).forEach(function (r) { r.addEventListener('change', buyerConditional); });
$('anyBtn').onclick = function () { $('project').value = 'Any'; setInvalid('project', false); };
applyMode();
$('f').addEventListener('submit', onSubmit);
['name', 'whatsapp', 'project', 'mobile', 'email', 'altnum', 'emailS'].forEach(function (id) {
  var el = $(id); if (!el) return;
  el.addEventListener('input', function () { var w = document.querySelector('[data-req="' + id + '"],[data-chk="' + id + '"]'); if (w) w.classList.remove('invalid'); });
});

$('retryBtn').onclick = function () { $('sendErr').style.display = 'none'; $('f').style.display = ''; };
var PRE = { buy: 'Buy', rent: 'Take on Rent', sell: 'Sell', giverent: 'Give on Rent' };
var pre = PRE[(new URLSearchParams(location.search).get('type') || '').toLowerCase()];
if (pre) { var pr = document.querySelector('input[name="want"][value="' + pre + '"]'); if (pr) { pr.checked = true; applyMode(); } }
