function FindProxyForURL(url, host) {
  // ==============================
  // CONFIG — بدون تغيير على البروكسي/المنافذ
  // ==============================
  var JO_PROXY_HOST = "127.0.0.1";
  var PORT_LOBBY          = 10010;
  var PORT_MATCH          = 20001;
  var PORT_RECRUIT_SEARCH = 12000;
  var PORT_UPDATES        = 8080;
  var PORT_CDN            = 443;

  var MODE = "SMART";

  // Sticky عام + Sticky أطول لفئات اللعب
  var STICKY_MINUTES_DEFAULT = 10;
  var STICKY_MINUTES_PLAY    = 30; // لوجي/مباراة/تجنيد

  // تأخير تفضيلي متكيّف لغير الأردن داخل اللعب
  var LATENCY_BASE_MS   = 120;  // البداية
  var LATENCY_STEP_MS   = 60;   // كل تكرار لنفس الـhost يضيف هذا
  var LATENCY_MAX_MS    = 420;  // سقف التأخير

  // ==============================
  // IPv6 الأردن — نفس قائمتك (بدون تغيير)
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
  // PUBG DOMAINS & URL PATTERNS — بدون تغيير
  // ==============================
  var PUBG_DOMAINS = {
    LOBBY:          ["*.pubgmobile.com","*.pubgmobile.net","*.proximabeta.com","*.igamecj.com"],
    MATCH:          ["*.gcloud.qq.com","gpubgm.com","*.igamecj.com","*.proximabeta.com"],
    RECRUIT_SEARCH: ["match.igamecj.com","match.proximabeta.com","teamfinder.igamecj.com","teamfinder.proximabeta.com","clan.igamecj.com"],
    UPDATES:        ["cdn.pubgmobile.com","updates.pubgmobile.com","patch.igamecj.com","hotfix.proximabeta.com","dlied1.qq.com","dlied2.qq.com"],
    CDNs:           ["cdn.igamecj.com","cdn.proximabeta.com","cdn.tencentgames.com","*.qcloudcdn.com","*.cloudfront.net","*.edgesuite.net"]
  };
  var URL_PATTERNS = {
    LOBBY:          ["*/account/login*","*/client/version*","*/status/heartbeat*","*/presence/*","*/friends/*"],
    MATCH:          ["*/matchmaking/*","*/mms/*","*/game/start*","*/game/join*","*/report/battle*"],
    RECRUIT_SEARCH: ["*/teamfinder/*","*/clan/*","*/social/*","*/search/*","*/recruit/*"],
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
      var sides=addr.split("::");
      var left=sides[0]?sides[0].split(":"):[];
      var right=sides[1]?sides[1].split(":"):[];
      var missing=8-(left.length+right.length);
      var mid=[]; for(var i=0;i<missing;i++) mid.push("0");
      var full=left.concat(mid,right);
      for(var j=0;j<full.length;j++) full[j]=("0000"+(full[j]||"0")).slice(-4);
      return full.join(":");
    }
    return addr.split(":").map(function(x){return("0000"+x).slice(-4);}).join(":");
  }
  function ipv6Hex(ip){ return expandIPv6(ip).replace(/:/g,"").toLowerCase(); }
  function inCidrV6(ip,cidr){
    var parts=cidr.split("/");
    var pref=parts[0]; var bits=parts.length>1?parseInt(parts[1],10):128;
    var ipHex=ipv6Hex(ip); var prefHex=ipv6Hex(pref);
    var nibbles=Math.floor(bits/4);
    if(ipHex.substring(0,nibbles)!==prefHex.substring(0,nibbles)) return false;
    if(bits%4===0) return true;
    var maskBits=bits%4; var mask=(0xF<<(4-maskBits))&0xF;
    var ipNib=parseInt(ipHex.charAt(nibbles),16)&mask;
    var pfNib=parseInt(prefHex.charAt(nibbles),16)&mask;
    return ipNib===pfNib;
  }
  function isJordanIPv6(ip){
    if(!ip || ip.indexOf(":")<0) return false;
    for(var i=0;i<JO_V6_PREFIXES.length;i++){ if(inCidrV6(ip, JO_V6_PREFIXES[i])) return true; }
    return false;
  }
  function wantJordanBias(){ return inCategory("LOBBY") || inCategory("MATCH") || inCategory("RECRUIT_SEARCH"); }

  // Sticky caches
  if (typeof _stickyCache === "undefined") { var _stickyCache = {}; }
  if (typeof _hostHits    === "undefined") { var _hostHits    = {}; } // عداد التكرارات لكل host

  function nowMin(){ return Math.floor((new Date()).getTime() / 60000); }
  function getStickyMinutesForHost(h){
    // لوجي/مباراة/تجنيد = أطول
    return wantJordanBias() ? STICKY_MINUTES_PLAY : STICKY_MINUTES_DEFAULT;
  }
  function stickyGet(h){
    var e=_stickyCache[h]; if(!e) return null;
    if (nowMin()-e.t > e.ttl){ return null; }
    return e.v;
  }
  function stickyPut(h,val){
    _stickyCache[h] = { t: nowMin(), ttl: getStickyMinutesForHost(h), v: val };
  }

  function adaptiveDelayNonJordan(joV6, h){
    if (joV6 || !wantJordanBias()) return;
    var hits = (_hostHits[h]||0);
    var delay = LATENCY_BASE_MS + hits*LATENCY_STEP_MS;
    if (delay > LATENCY_MAX_MS) delay = LATENCY_MAX_MS;
    // wait-loop
    var start = new Date().getTime();
    while (new Date().getTime() - start < delay) { /* bias toward JO */ }
    _hostHits[h] = hits + 1; // زوّد العداد لهذا المضيف
  }

  // ==============================
  // Fast exits
  // ==============================
  if (matchDomain(host, YOUTUBE_DOMAINS)) return "DIRECT";

  var destIP = dnsResolve(host);
  var joV6   = isJordanIPv6(destIP);

  var cached = stickyGet(host);
  if (cached) return cached;

  // ==============================
  // Jordan bias (أقوى، بدون لمس بروكسي/نطاقاتك)
  // ==============================
  // 1) IPv6 أردني → DIRECT فورًا (حتى لو CDN/Updates)
  if (destIP && joV6){ stickyPut(host,"DIRECT"); return "DIRECT"; }

  // 2) داخل اللعب: أضف تأخير متكيّف لغير الأردن ثم طبّق قرارك الأصلي
  if (inCategory("MATCH")) {
    adaptiveDelayNonJordan(joV6, host);
    var r1 = proxyLine(PORT_MATCH); stickyPut(host,r1); return r1;
  }
  if (inCategory("RECRUIT_SEARCH")) {
    adaptiveDelayNonJordan(joV6, host);
    var r2 = proxyLine(PORT_RECRUIT_SEARCH); stickyPut(host,r2); return r2;
  }
  if (inCategory("LOBBY")) {
    adaptiveDelayNonJordan(joV6, host);
    var r3 = proxyLine(PORT_LOBBY); stickyPut(host,r3); return r3;
  }

  // 3) Updates/CDN — تبقى كما هي (DIRECT)، لكن لو الوجهة أردنية IPv6 صارت DIRECT مسبقًا
  if (inCategory("UPDATES") || inCategory("CDNs")) { stickyPut(host,"DIRECT"); return "DIRECT"; }

  // 4) أي شيء آخر: حافظ على سلوكك الافتراضي
  var fb = proxyLine(PORT_LOBBY); stickyPut(host, fb); return fb;
}
