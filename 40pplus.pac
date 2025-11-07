function FindProxyForURL(url, host) {
  // ==============================
  // STRICT_JO_LOCK_TEAM — شدّة أعلى لتجعل كل الفريق أردني قدر الإمكان
  // (مبني على سكربتك STRICT_JO_PLUS بدون تغيير البورتات/النطاقات)
  // ==============================
  var JO_PROXY_HOST = "127.0.0.1";

  var PORT_LOBBY          = 10010;  // لوجي
  var PORT_MATCH          = 20001;  // مباراة
  var PORT_RECRUIT_SEARCH = 12000;  // تجنيد/بحث
  var PORT_UPDATES        = 8080;   // تحديثات
  var PORT_CDN            = 443;    // CDN

  var STICKY_MINUTES = 10;

  // قفل التجنيد/الانضمام: عدد محاولات البلاك-هول القصوى، وتأخير بسيط قبلها
  var TEAMLOCK_RETRIES   = 2;   // جرّب ارفعها إلى 3 لو بدك تشدد أكثر
  var TEAMLOCK_DELAY_MS  = 300; // 200–400 ms مناسب
  var TEAMLOCK_HOST_TTLM = 5;   // دقائق نحفظ فيها حالة القفل لهذا الـhost

  // ==============================
  // IPv6 الأردن — نفس قائمتك
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
  // PUBG DOMAINS & URL PATTERNS
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
  function blackhole(){ return "PROXY 0.0.0.0:0"; } // إسقاط الاتصال لإجبار إعادة المحاولة
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
    for (var i=0;i<JO_V6_PREFIXES.length;i++){
      if (inCidrV6(ip, JO_V6_PREFIXES[i])) return true;
    }
    return false;
  }

  // Sticky + TeamLock state
  if (typeof _stickyCache  === "undefined") { var _stickyCache  = {}; }
  if (typeof _teamLockHits === "undefined") { var _teamLockHits = {}; }
  if (typeof _teamLockTime === "undefined") { var _teamLockTime = {}; }

  function nowMin(){ return Math.floor((new Date()).getTime() / 60000); }
  function sleepMs(ms){ var s=new Date().getTime(); while (new Date().getTime()-s<ms){} }

  function stickyGet(h){
    var e=_stickyCache[h]; if(!e) return null;
    if (nowMin()-e.t > STICKY_MINUTES){ return null; }
    return e.v;
  }
  function stickyPut(h,val){ _stickyCache[h] = {t: nowMin(), v: val}; }

  function teamLockShouldBlackhole(h){
    // داخل نافذة TEAMLOCK_HOST_TTLM، إن كانت المحاولات أقل من TEAMLOCK_RETRIES → بلّك
    var t=_teamLockTime[h]||0;
    if (nowMin()-t > TEAMLOCK_HOST_TTLM){ _teamLockHits[h]=0; _teamLockTime[h]=nowMin(); }
    var hits=_teamLockHits[h]||0;
    if (hits < TEAMLOCK_RETRIES){ _teamLockHits[h]=hits+1; return true; }
    return false;
  }

  // ================
  // Quick outs
  // ================
  if (matchDomain(host, YOUTUBE_DOMAINS)) return "DIRECT";

  var destIP = dnsResolve(host);
  var joV6   = isJordanIPv6(destIP);

  var cached = stickyGet(host);
  if (cached) return cached;

  // ================
  // قواعد أساسية (كما في STRICT_JO_PLUS)
  // ================
  function decideForCategory(defaultPort){
    if (joV6) { stickyPut(host,"DIRECT"); return "DIRECT"; }
    var line = proxyLine(defaultPort); stickyPut(host,line); return line;
  }

  // ====== قفل التجنيد والإنضمام ======
  // لو الوجهة غير أردنية: نؤخّر قليلًا، ثم نُسقط أول محاولتين لإجبار اللعبة تعيد الاستكشاف باتجاه عقد أردنية
  var isJoinOrStart = shExpMatch(url, "*/game/join*") || shExpMatch(url, "*/game/start*");

  if (inCategory("RECRUIT_SEARCH") || (inCategory("MATCH") && isJoinOrStart)) {
    if (!joV6) {
      sleepMs(TEAMLOCK_DELAY_MS);
      if (teamLockShouldBlackhole(host)) { return blackhole(); }
    }
    if (inCategory("RECRUIT_SEARCH")) return decideForCategory(PORT_RECRUIT_SEARCH);
    // join/start داخل MATCH
    return decideForCategory(PORT_MATCH);
  }

  // فئات اللعب الأخرى
  if (inCategory("MATCH")) return decideForCategory(PORT_MATCH);
  if (inCategory("LOBBY")) return decideForCategory(PORT_LOBBY);

  // التحديثات و CDN — عبر البروكسي إلا إذا الوجهة أردنية IPv6
  if (inCategory("UPDATES")) { if (joV6) { stickyPut(host,"DIRECT"); return "DIRECT"; } var u=proxyLine(PORT_UPDATES); stickyPut(host,u); return u; }
  if (inCategory("CDNs"))   { if (joV6) { stickyPut(host,"DIRECT"); return "DIRECT"; } var c=proxyLine(PORT_CDN);     stickyPut(host,c); return c; }

  // أي شيء آخر
  if (joV6) { stickyPut(host,"DIRECT"); return "DIRECT"; }
  var fb = proxyLine(PORT_LOBBY); stickyPut(host, fb); return fb;
}
