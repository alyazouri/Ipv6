function FindProxyForURL(url, host) {
  // ==============================
  // STRICT_JO_TUNED_V2 — أقوى تحيز للأردن بدون تغيير بروكسي/نطاقاتك
  // ==============================
  var JO_PROXY_HOST = "127.0.0.1";

  var PORT_LOBBY          = 10010;
  var PORT_MATCH          = 20001;
  var PORT_RECRUIT_SEARCH = 12000;
  var PORT_UPDATES        = 8080;
  var PORT_CDN            = 443;

  // Sticky أطول لمسارات اللعب
  var STICKY_MINUTES_PLAY = 60; // كان 10–30، خلّيناه 60 لتثبيت الريجن
  var STICKY_MINUTES_MISC = 10;

  // تأخير متكيّف أقوى لغير الأردن داخل اللعب فقط
  var LATENCY_BASE_MS = 220;  // ابدأ أعلى (جرّب 180–260)
  var LATENCY_STEP_MS = 80;   // يزيد مع تكرار نفس الـhost
  var LATENCY_MAX_MS  = 700;  // سقف أقوى

  // ==============================
  // IPv6 الأردن — كما هي (من نصّك)
  // ==============================
  var JO_V6_PREFIXES = [
    "2001:32c0:300::/40","2001:32c0:400::/39","2001:32c0:b00::/40","2001:32c0:c00::/38",
    "2001:32c0:1000::/36","2001:32c0:2000::/35","2001:32c0:4000::/34","2001:32c0:8000::/33",
    "2001:32c1::/32","2001:32c2::/31","2001:32c4::/30",
    "2a00:18d0:100::/40","2a00:18d0:200::/39","2a00:18d0:400::/39","2a00:18d0:b00::/40","2a00:18d0:c00::/38",
    "2a00:18d0:1000::/36","2a00:18d0:2000::/35","2a00:18d0:4000::/34","2a00:18d0:8000::/33",
    "2a00:18d8:100::/40","2a00:18d8:300::/40","2a00:18d8:400::/40","2a00:18d8:600::/40","2a00:18d8:c00::/39","2a00:18d8:f00::/40",
    "2a00:18d8:1000::/36","2a00:18d8:2000::/35","2a00:18d8:4000::/34","2a00:18d8:8000::/33",
    "2a00:18d9::/32","2a00:18da::/31","2a00:18dc::/30",
    "2a03:6b00::/40","2a03:6b00:300::/40","2a03:6b00:400::/39","2a03:6b00:b00::/40","2a03:6b00:c00::/38",
    "2a03:6b00:1000::/36","2a03:6b00:2000::/35","2a03:6b00:4000::/34","2a03:6b00:8000::/33",
    "2a03:6b01::/32","2a03:6b02::/31","2a03:6b04::/30",
    "2a03:b640::/40","2a03:b640:300::/40","2a03:b640:400::/39","2a03:b640:c00::/38",
    "2a03:b640:1000::/36","2a03:b640:2000::/35","2a03:b640:4000::/34","2a03:b640:8000::/33"
  ];

  // ==============================
  // PUBG DOMAINS & URL PATTERNS — مضاف لها Endpoints إضافية شائعة
  // ==============================
  var PUBG_DOMAINS = {
    LOBBY: [
      "*.pubgmobile.com","*.pubgmobile.net","*.proximabeta.com","*.igamecj.com",
      "gateway.igamecj.com","gateway.proximabeta.com","presence.igamecj.com","presence.proximabeta.com",
      "friends.igamecj.com","friends.proximabeta.com","status.igamecj.com","status.proximabeta.com"
    ],
    MATCH: [
      "*.gcloud.qq.com","gpubgm.com","*.igamecj.com","*.proximabeta.com",
      "mms.igamecj.com","mms.proximabeta.com","match.igamecj.com","match.proximabeta.com",
      "msdk.qq.com","qos.igamecj.com","qos.proximabeta.com"
    ],
    RECRUIT_SEARCH: [
      "match.igamecj.com","match.proximabeta.com",
      "teamfinder.igamecj.com","teamfinder.proximabeta.com",
      "clan.igamecj.com","clan.proximabeta.com",
      "social.igamecj.com","social.proximabeta.com",
      "party.igamecj.com","party.proximabeta.com"
    ],
    UPDATES: ["cdn.pubgmobile.com","updates.pubgmobile.com","patch.igamecj.com","hotfix.proximabeta.com","dlied1.qq.com","dlied2.qq.com"],
    CDNs:    ["cdn.igamecj.com","cdn.proximabeta.com","cdn.tencentgames.com","*.qcloudcdn.com","*.cloudfront.net","*.edgesuite.net"]
  };

  var URL_PATTERNS = {
    LOBBY:          ["*/account/login*","*/client/version*","*/status/heartbeat*","*/presence/*","*/friends/*","*/gateway/*"],
    MATCH:          ["*/matchmaking/*","*/mms/*","*/game/start*","*/game/join*","*/report/battle*","*/qos/*"],
    RECRUIT_SEARCH: ["*/teamfinder/*","*/clan/*","*/social/*","*/search/*","*/recruit/*","*/party/*"],
    UPDATES:        ["*/patch*","*/update*","*/hotfix*","*/download*","*/assets/*","*/assetbundle*","*/obb*"],
    CDNs:           ["*/cdn/*","*/image/*","*/media/*","*/video/*","*/res/*","*/pkg/*"]
  };

  var YOUTUBE_DOMAINS = ["youtube.com","youtu.be","googlevideo.com","ytimg.com","youtube-nocookie.com"];

  // ==============================
  // Helpers
  // ==============================
  function proxyLine(port){ return "SOCKS5 " + JO_PROXY_HOST + ":" + port; }
  function matchDomain(h,list){
    for (var i=0;i<list.length;i++){
      var pat=list[i];
      if (pat.indexOf("*")>=0){ if (shExpMatch(h,pat)) return true; }
      else { if (dnsDomainIs(h,pat)) return true; }
    }
    return false;
  }
  function matchURL(u,patterns){ for (var i=0;i<patterns.length;i++){ if (shExpMatch(u,patterns[i])) return true; } return false; }
  function inCategory(cat){ return matchDomain(host,PUBG_DOMAINS[cat]) || matchURL(url,URL_PATTERNS[cat]); }

  function expandIPv6(addr){
    if(!addr) return "";
    if(addr.indexOf("::")>=0){
      var s=addr.split("::"), left=s[0]?s[0].split(":"):[], right=s[1]?s[1].split(":"):[];
      var m=8-(left.length+right.length), mid=[]; for(var i=0;i<m;i++) mid.push("0");
      var full=left.concat(mid,right); for(var j=0;j<full.length;j++) full[j]=("0000"+(full[j]||"0")).slice(-4);
      return full.join(":");
    }
    return addr.split(":").map(function(x){return("0000"+x).slice(-4);}).join(":");
  }
  function ipv6Hex(ip){ return expandIPv6(ip).replace(/:/g,"").toLowerCase(); }
  function inCidrV6(ip,cidr){
    var p=cidr.split("/"), pref=p[0], bits=p.length>1?parseInt(p[1],10):128;
    var ipHex=ipv6Hex(ip), prefHex=ipv6Hex(pref), n=Math.floor(bits/4);
    if(ipHex.substring(0,n)!==prefHex.substring(0,n)) return false;
    if(bits%4===0) return true;
    var mb=bits%4, mask=(0xF<<(4-mb))&0xF;
    var inib=parseInt(ipHex.charAt(n),16)&mask, pnib=parseInt(prefHex.charAt(n),16)&mask;
    return inib===pnib;
  }
  function isJordanIPv6(ip){
    if(!ip || ip.indexOf(":")<0) return false;
    for (var i=0;i<JO_V6_PREFIXES.length;i++){ if (inCidrV6(ip, JO_V6_PREFIXES[i])) return true; }
    return false;
  }

  // Sticky/Hit counters
  if (typeof _stickyCache === "undefined") { var _stickyCache = {}; }
  if (typeof _hostHits    === "undefined") { var _hostHits    = {}; }

  function nowMin(){ return Math.floor((new Date()).getTime() / 60000); }
  function stickyGet(h){
    var e=_stickyCache[h]; if(!e) return null;
    var ttl = e.play ? STICKY_MINUTES_PLAY : STICKY_MINUTES_MISC;
    if (nowMin()-e.t > ttl) return null;
    return e.v;
  }
  function stickyPut(h,val,isPlay){ _stickyCache[h] = { t: nowMin(), v: val, play: !!isPlay }; }

  function adaptiveDelayNonJordan(isJo, h, isPlay){
    if (isJo || !isPlay) return;
    var hits = (_hostHits[h]||0);
    var delay = LATENCY_BASE_MS + hits*LATENCY_STEP_MS;
    if (delay > LATENCY_MAX_MS) delay = LATENCY_MAX_MS;
    var s = new Date().getTime(); while (new Date().getTime()-s < delay) {}
    _hostHits[h] = hits + 1;
  }

  // ==============================
  // Fast exits
  // ==============================
  if (matchDomain(host, YOUTUBE_DOMAINS)) return "DIRECT";

  var destIP = dnsResolve(host);
  var joV6   = isJordanIPv6(destIP);

  var cached = stickyGet(host);
  if (cached) return cached;

  // DIRECT فوري لأي وجهة IPv6 أردنية
  if (joV6) { stickyPut(host,"DIRECT", inCategory("LOBBY")||inCategory("MATCH")||inCategory("RECRUIT_SEARCH")); return "DIRECT"; }

  // فئات اللعب — تأخير متكيّف ثم قرارك الأصلي (بروكسي الفئة)
  var isPlay = inCategory("LOBBY") || inCategory("MATCH") || inCategory("RECRUIT_SEARCH");
  if (isPlay) {
    adaptiveDelayNonJordan(joV6, host, true);
    if (inCategory("MATCH"))          { var r1 = proxyLine(PORT_MATCH);          stickyPut(host,r1,true); return r1; }
    if (inCategory("RECRUIT_SEARCH")) { var r2 = proxyLine(PORT_RECRUIT_SEARCH); stickyPut(host,r2,true); return r2; }
    if (inCategory("LOBBY"))          { var r3 = proxyLine(PORT_LOBBY);          stickyPut(host,r3,true); return r3; }
  }

  // Updates/CDN — كما هي
  if (inCategory("UPDATES") || inCategory("CDNs")) { stickyPut(host,"DIRECT",false); return "DIRECT"; }

  // افتراضي
  var fb = proxyLine(PORT_LOBBY); stickyPut(host, fb, false); return fb;
}
