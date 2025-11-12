function FindProxyForURL(url, host) {
  // ==============================
  // STRICT_JO_PLUS Pro+ — Same-Prefix Bias for PUBG (IPv4+IPv6)
  // ==============================
  // بروكسيات أردنية حسب المزوّد (ضِف/عدّل اللي عندك)
  var JO_EGRESS = [
    {
      name: "GO",
      proxyHost: "212.35.66.45", // انت حاطّه أصلاً
      ports: { GAME: 20001, UPD: 8080, CDN: 443 },
      v4: ["212.35.64.0/19"],                  // GO / Batelco
      v6: ["2a00:18d0::/29"]                   // GO / Batelco (IPv6)
    },
    {
      name: "Zain",
      proxyHost: "REPLACE_ME_ZAIN",            // إذا عندك مخرج Zain (اختياري)
      ports: { GAME: 20001, UPD: 8080, CDN: 443 },
      v4: ["176.29.0.0/17","213.139.32.0/20"], // Zain IPv4
      v6: ["2a03:b640::/32"]                   // Zain IPv6
    },
    {
      name: "Umniah",
      proxyHost: "REPLACE_ME_UMNIAH",          // إذا عندك مخرج Umniah (اختياري)
      ports: { GAME: 20001, UPD: 8080, CDN: 443 },
      v4: [],                                   // (ضيف إن وجِدت)
      v6: ["2a03:6b00::/29"]                   // Umniah IPv6
    },
    {
      name: "JO-Core",
      proxyHost: "REPLACE_ME_JOCORE",          // إن حبيت خروج لجامعات/حكومة/IX
      ports: { GAME: 20001, UPD: 8080, CDN: 443 },
      v4: [],                                   // (اختياري)
      v6: ["2001:32c0::/29"]                   // تخصيصات وطنية
    }
  ];

  // لو ما لقينا مزوّد مطابق، استعمل أول مخرج معرف (GO عندك)
  var DEFAULT_EGRESS_IDX = 0;

  // ==============================
  // PUBG categories (موحّد GAME)
  // ==============================
  var PUBG_DOMAINS = {
    LOBBY:          ["*.pubgmobile.com","*.pubgmobile.net","*.proximabeta.com","*.igamecj.com"],
    MATCH:          ["*.gcloud.qq.com","gpubgm.com","*.igamecj.com","*.proximabeta.com"],
    RECRUIT_SEARCH: ["match.igamecj.com","match.proximabeta.com","teamfinder.igamecj.com","teamfinder.proximabeta.com","clan.igamecj.com"]
  };
  var URL_PATTERNS = {
    LOBBY:          ["*/account/login*","*/client/version*","*/status/heartbeat*","*/presence/*","*/friends/*"],
    MATCH:          ["*/matchmaking/*","*/mms/*","*/game/start*","*/game/join*","*/report/battle*"],
    RECRUIT_SEARCH: ["*/teamfinder/*","*/clan/*","*/social/*","*/search/*","*/recruit/*"],
    UPDATES:        ["*/patch*","*/update*","*/hotfix*","*/download*","*/assets/*","*/assetbundle*","*/obb*"],
    CDNs:           ["*/cdn/*","*/image/*","*/media/*","*/video/*","*/res/*","*/pkg/*"]
  };
  var CDN_DOMAINS = ["cdn.pubgmobile.com","updates.pubgmobile.com","patch.igamecj.com","hotfix.proximabeta.com","dlied1.qq.com","dlied2.qq.com","cdn.igamecj.com","cdn.proximabeta.com","cdn.tencentgames.com","*.qcloudcdn.com","*.cloudfront.net","*.edgesuite.net"];
  var YOUTUBE_DOMAINS = ["youtube.com","youtu.be","googlevideo.com","ytimg.com","youtube-nocookie.com"];

  // ==============================
  // Helpers
  // ==============================
  function proxyLine(host, port){ return "SOCKS5 " + host + ":" + port; }
  function matchDomain(h,list){ for (var i=0;i<list.length;i++){ var p=list[i]; if (p.indexOf("*")>=0){ if (shExpMatch(h,p)) return true; } else { if (dnsDomainIs(h,p)) return true; } } return false; }
  function matchURL(u,patterns){ for (var i=0;i<patterns.length;i++){ if (shExpMatch(u,patterns[i])) return true; } return false; }
  function inCategory(cat){ return matchDomain(host,PUBG_DOMAINS[cat]) || matchURL(url,URL_PATTERNS[cat]); }
  function baseDomain(h){ var parts=h.split("."); return parts.length<=2?h:parts.slice(parts.length-2).join("."); }

  // IPv6 helpers
  function isIPv6(ip){ return ip && ip.indexOf(":")>=0; }
  function expandIPv6(addr){
    if(!addr) return "";
    if(addr.indexOf("::")>=0){
      var s=addr.split("::"), left=s[0]?s[0].split(":"):[], right=s[1]?s[1].split(":"):[];
      var missing=8-(left.length+right.length), mid=[]; for(var i=0;i<missing;i++) mid.push("0");
      var full=left.concat(mid,right);
      for(var j=0;j<full.length;j++) full[j]=("0000"+(full[j]||"0")).slice(-4);
      return full.join(":");
    }
    return addr.split(":").map(function(x){return("0000"+x).slice(-4);}).join(":");
  }
  function ipv6Hex(ip){ return expandIPv6(ip).replace(/:/g,"").toLowerCase(); }
  function inCidrV6(ip,cidr){
    var parts=cidr.split("/"); var pref=parts[0]; var bits=parts.length>1?parseInt(parts[1],10):128;
    var ipHex=ipv6Hex(ip), prefHex=ipv6Hex(pref);
    var nibbles=Math.floor(bits/4);
    if(ipHex.substring(0,nibbles)!==prefHex.substring(0,nibbles)) return false;
    if(bits%4===0) return true;
    var mask=(0xF<<(4-(bits%4)))&0xF;
    return (parseInt(ipHex.charAt(nibbles),16)&mask)===(parseInt(prefHex.charAt(nibbles),16)&mask);
  }

  // IPv4 helpers
  function isIPv4(ip){ return ip && ip.indexOf(".")>=0 && ip.indexOf(":")<0; }
  function ip4ToInt(ip){ var p=ip.split("."); return ((+p[0]<<24)>>>0)+((+p[1]<<16)>>>0)+((+p[2]<<8)>>>0)+(+p[3]>>>0); }
  function inCidrV4(ip,cidr){
    var parts=cidr.split("/"); var base=parts[0]; var bits=parts.length>1?parseInt(parts[1],10):32;
    var ipInt=ip4ToInt(ip), baseInt=ip4ToInt(base);
    var mask = bits===0 ? 0 : ((0xFFFFFFFF << (32-bits))>>>0);
    return (ipInt & mask) === (baseInt & mask);
  }

  // Prefix matching helpers
  function isInPrefixes(ip, v4list, v6list){
    if (!ip) return false;
    if (isIPv4(ip)) { for (var i=0;i<v4list.length;i++) if (inCidrV4(ip, v4list[i])) return true; }
    else { for (var j=0;j<v6list.length;j++) if (inCidrV6(ip, v6list[j])) return true; }
    return false;
  }

  // اختَر مزوّد بناءً على IP الوجهة (نفس النطاق = نفس المزوّد = نفس الإيغرِس)
  function pickISPByDest(ip){
    if (!ip) return DEFAULT_EGRESS_IDX;
    for (var i=0;i<JO_EGRESS.length;i++){
      if (isInPrefixes(ip, JO_EGRESS[i].v4, JO_EGRESS[i].v6)) return i;
    }
    return DEFAULT_EGRESS_IDX;
  }

  // Sticky cache — على مستوى baseDomain (ويحمل اسم المزوّد المختار)
  if (typeof _stickyCache === "undefined") { var _stickyCache = {}; }
  function nowMin(){ return Math.floor((new Date()).getTime() / 60000); }
  var STICKY_MINUTES = 10;
  function stickyKey(h){ return baseDomain(h); }
  function stickyGet(h){
    var k = stickyKey(h), e=_stickyCache[k]; if(!e) return null;
    if (nowMin()-e.t > STICKY_MINUTES){ return null; }
    return e.v; // صيغة: { line: "PROXY ...", idx: <egress index> }
  }
  function stickyPut(h,val){ _stickyCache[stickyKey(h)] = {t: nowMin(), v: val}; }

  // Quick outs
  if (matchDomain(host, YOUTUBE_DOMAINS)) return "DIRECT";

  // Resolve once
  var destIP = dnsResolve(host);
  // حدّد المزوّد الأنسب للوجهة (عشان “نفس النطاق”)
  var ispIdx = pickISPByDest(destIP);
  var ISP    = JO_EGRESS[ispIdx];

  // Sticky reuse
  var cached = stickyGet(host);
  if (cached) return cached.line;

  // قرارات جاهزة
  function lineGAME(){ return proxyLine(ISP.proxyHost, ISP.ports.GAME); }
  function lineUPD(){  return proxyLine(ISP.proxyHost, ISP.ports.UPD ); }
  function lineCDN(){  return proxyLine(ISP.proxyHost, ISP.ports.CDN ); }

  // قاعدة ذهبية:
  // - لو الوجهة ضمن رينجات ISP أردنية (v4 أو v6) → DIRECT (بدون لفّ)
  // - غير ذلك → استخدم مخرج ISP المختار (عشان تطابق نطاق الوجهة قدر الإمكان)
  var isJO = isInPrefixes(destIP, ISP.v4, ISP.v6);
  function decideGame(){
    if (isJO) { stickyPut(host, {line:"DIRECT", idx:ispIdx}); return "DIRECT"; }
    var l = lineGAME(); stickyPut(host,{line:l, idx:ispIdx}); return l;
  }
  function decideUPD(){
    if (isJO) { stickyPut(host, {line:"DIRECT", idx:ispIdx}); return "DIRECT"; }
    var l = lineUPD(); stickyPut(host,{line:l, idx:ispIdx}); return l;
  }
  function decideCDN(){
    if (isJO) { stickyPut(host, {line:"DIRECT", idx:ispIdx}); return "DIRECT"; }
    var l = lineCDN(); stickyPut(host,{line:l, idx:ispIdx}); return l;
  }

  // فئات PUBG الحسّاسة — موحّدة على GAME
  if (inCategory("MATCH"))          return decideGame();
  if (inCategory("RECRUIT_SEARCH")) return decideGame();
  if (inCategory("LOBBY"))          return decideGame();

  // التحديثات والـCDN
  if (matchDomain(host, CDN_DOMAINS) || matchURL(url, URL_PATTERNS.UPDATES) || matchURL(url, URL_PATTERNS.CDNs)) {
    return decideCDN(); // أو decideUPD() حسب تفضيلك
  }

  // باقي الأشياء → نفس خط الماتش (لتوحيد الإيغرِس افتراضياً)
  return decideGame();
}
