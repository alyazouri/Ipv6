function FindProxyForURL(url, host) {
  // ==============================
  // CONFIG (بدون أي تغيير على البروكسي/المنافذ الأصلية)
  // ==============================
  var JO_PROXY_HOST = "127.0.0.1";
  var PORT_LOBBY          = 10010;
  var PORT_MATCH          = 20001;
  var PORT_RECRUIT_SEARCH = 12000;
  var PORT_UPDATES        = 8080;
  var PORT_CDN            = 443;

  var MODE = "SMART";
  var STICKY_MINUTES = 10;

  // تأخير بسيط يطبَّق فقط على الوجهات غير الأردنية داخل فئات اللعب
  var LATENCY_DELAY_MS = 150; // غيّره بين 100–250 لو بدك تشدد التفضيل

  // ==============================
  // IPv6 الأردن — مستخرجة تلقائيًا (بدون تغيير)
  // ==============================
  var JO_V6_PREFIXES = [
    "2001:32c0:300::/40",
    "2001:32c0:400::/39",
    "2001:32c0:b00::/40",
    "2001:32c0:c00::/38",
    "2001:32c0:1000::/36",
    "2001:32c0:2000::/35",
    "2001:32c0:4000::/34",
    "2001:32c0:8000::/33",
    "2001:32c1::/32",
    "2001:32c2::/31",
    "2001:32c4::/30",
    "2a00:18d0:100::/40",
    "2a00:18d0:200::/39",
    "2a00:18d0:400::/39",
    "2a00:18d0:b00::/40",
    "2a00:18d0:c00::/38",
    "2a00:18d0:1000::/36",
    "2a00:18d0:2000::/35",
    "2a00:18d0:4000::/34",
    "2a00:18d0:8000::/33",
    "2a00:18d8:100::/40",
    "2a00:18d8:300::/40",
    "2a00:18d8:400::/40",
    "2a00:18d8:600::/40",
    "2a00:18d8:c00::/39",
    "2a00:18d8:f00::/40",
    "2a00:18d8:1000::/36",
    "2a00:18d8:2000::/35",
    "2a00:18d8:4000::/34",
    "2a00:18d8:8000::/33",
    "2a00:18d9::/32",
    "2a00:18da::/31",
    "2a00:18dc::/30",
    "2a03:6b00::/40",
    "2a03:6b00:300::/40",
    "2a03:6b00:400::/39",
    "2a03:6b00:b00::/40",
    "2a03:6b00:c00::/38",
    "2a03:6b00:1000::/36",
    "2a03:6b00:2000::/35",
    "2a03:6b00:4000::/34",
    "2a03:6b00:8000::/33",
    "2a03:6b01::/32",
    "2a03:6b02::/31",
    "2a03:6b04::/30",
    "2a03:b640::/40",
    "2a03:b640:300::/40",
    "2a03:b640:400::/39",
    "2a03:b640:c00::/38",
    "2a03:b640:1000::/36",
    "2a03:b640:2000::/35",
    "2a03:b640:4000::/34",
    "2a03:b640:8000::/33"
  ];

  // ==============================
  // PUBG DOMAINS & URL PATTERNS (بدون تغيير)
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

  // ================
  // Helpers
  // ================
  function proxyLine(port){ return "SOCKS5 " + JO_PROXY_HOST + ":" + port; }

  function matchDomain(host,list){
    for (var i=0;i<list.length;i++){
      var pat=list[i];
      if (pat.indexOf("*")>=0){ if (shExpMatch(host,pat)) return true; }
      else { if (dnsDomainIs(host,pat)) return true; }
    }
    return false;
  }
  function matchURL(url,patterns){
    for (var i=0;i<patterns.length;i++){
      if (shExpMatch(url,patterns[i])) return true;
    }
    return false;
  }
  function inCategory(cat){ return matchDomain(host,PUBG_DOMAINS[cat]) || matchURL(url,URL_PATTERNS[cat]); }

  // IPv6 utils
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
    } else {
      return addr.split(":").map(function(x){return("0000"+x).slice(-4);}).join(":");
    }
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
    for(var i=0;i<JO_V6_PREFIXES.length;i++){
      if(inCidrV6(ip, JO_V6_PREFIXES[i])) return true;
    }
    return false;
  }

  function wantJordanBias(){ return inCategory("LOBBY") || inCategory("MATCH") || inCategory("RECRUIT_SEARCH"); }

  // Sticky cache (بدون تغيير على قيم الإعداد)
  if (typeof _stickyCache === "undefined") { var _stickyCache = {}; }
  function nowMin(){ return Math.floor((new Date()).getTime() / 60000); }
  function stickyGet(h){
    var e=_stickyCache[h]; if(!e) return null;
    if (nowMin()-e.t > STICKY_MINUTES){ return null; }
    return e.v;
  }
  function stickyPut(h,val){ _stickyCache[h] = {t: nowMin(), v: val}; }

  // ================
  // Fast exits
  // ================
  if (matchDomain(host, YOUTUBE_DOMAINS)) return "DIRECT";

  var destIP = dnsResolve(host);
  var joV6   = isJordanIPv6(destIP);

  // استرجاع قرار سابق لو موجود
  var cached = stickyGet(host);
  if (cached) return cached;

  // ==============================
  // Jordan-bias logic (بدون المساس بالبروكسي/النطاقات)
  // ==============================
  // 1) إن كانت الوجهة IPv6 أردنية → DIRECT فورًا.
  // 2) إن لم تكن أردنية وكان الطلب ضمن (LOBBY/MATCH/RECRUIT_SEARCH) نضيف تأخير خفيف
  //    قبل إعادة القرار الأصلي (كما في سكربتك: بروكسي للفئات الأساسية، وDIRECT للتحديثات/CDN).
  function delayNonJordanIfNeeded(){
    if (!joV6 && wantJordanBias() && LATENCY_DELAY_MS > 0){
      var start = new Date().getTime();
      while (new Date().getTime() - start < LATENCY_DELAY_MS) { /* deliberate no-op */ }
    }
  }

  if (MODE === "SMART" && destIP && joV6){
    // الأردن IPv6 → DIRECT (كما هو)
    if (inCategory("LOBBY") || inCategory("MATCH") || inCategory("RECRUIT_SEARCH")) { stickyPut(host,"DIRECT"); return "DIRECT"; }
    if (inCategory("UPDATES") || inCategory("CDNs")) { stickyPut(host,"DIRECT"); return "DIRECT"; }
  }

  // فئات اللعب الأساسية — نضيف تأخير لغير الأردن ثم نعيد القرار الأصلي
  if (inCategory("LOBBY")) {
    delayNonJordanIfNeeded();
    var r = proxyLine(PORT_LOBBY); stickyPut(host,r); return r;
  }
  if (inCategory("MATCH")) {
    delayNonJordanIfNeeded();
    var r2 = proxyLine(PORT_MATCH); stickyPut(host,r2); return r2;
  }
  if (inCategory("RECRUIT_SEARCH")) {
    delayNonJordanIfNeeded();
    var r3 = proxyLine(PORT_RECRUIT_SEARCH); stickyPut(host,r3); return r3;
  }

  // التحديثات / CDN — تبقى DIRECT كما في سكربتك
  if (inCategory("UPDATES") || inCategory("CDNs")) { stickyPut(host,"DIRECT"); return "DIRECT"; }

  // إن كانت الوجهة أردنية IPv6 خارج الفئات
  if (destIP && joV6) { stickyPut(host,"DIRECT"); return "DIRECT"; }

  // الافتراضي كما هو
  var fb = proxyLine(PORT_LOBBY); stickyPut(host, fb); return fb;
}
