function FindProxyForURL(url, host) {
  // ======================================
  // JO-ULTRA-DIVERSITY — PUBG (IPv4+IPv6)
  // هدف: وجوه أردنية أكثر + تنويع متدرّج بدون تخريب الاستقرار
  // ======================================

  // === المود ===
  // "COZY" (60د) | "HUNT" (30د) | "HUNT_LITE" (45د افتراضي)
  var MODE = "HUNT_LITE";
  var EPOCH_MINUTES = (MODE==="COZY")?60:(MODE==="HUNT"?30:45);
  var RECRUIT_SALT_OFFSET = 1337;    // تنويع طفيف للتجنيد فقط (غيّره لـ 0 لو بدك نفس اللوبي)
  var STICKY_MINUTES = Math.min(10, EPOCH_MINUTES);

  // === المداخل الأردنية (بدون Orange) ===
  var JO_EGRESS = [
    // --- GO / Batelco (fallback غير سكني عادة) ---
    {
      name: "GO",
      proxyHost: "212.35.66.45",
      ports: { GAME: 20001, UPD: 8080, CDN: 443 },
      v4: ["212.35.64.0/19"],
      v6: ["2a00:18d0::/29"],
      weight: 1, residential: false
    },
    // --- Zain (RES) — تم ضبطه حسب طلبك ---
    {
      name: "Zain-RES",
      proxyHost: "176.29.21.98",
      ports: { GAME: 443, UPD: 8080, CDN: 443 }, // كما زوّدتني: 443,8080
      v4: ["176.29.0.0/17","213.139.32.0/20"],
      v6: ["2a03:b640::/32"],
      weight: 3, residential: true
    },
    // --- Umniah (RES) — اختياري لو عندك مخرج ---
    {
      name: "Umniah-RES",
      proxyHost: "91.106.109.12",
      ports: { GAME: 443, UPD: 8080, CDN: 443 },
      v4: [],
      v6: ["2a03:6b00::/29"],
      weight: 3, residential: true
    }
  ];
  var DEFAULT_EGRESS_IDX = 0; // GO كافتراضي لو ما في تطابق

  // DIRECT حصراً للرنجات السكنية الأردنية
  var RES_V4 = ["176.29.0.0/17","213.139.32.0/20"]; // Zain RES
  var RES_V6 = ["2a03:b640::/32","2a03:6b00::/29"]; // Zain+Umniah RES

  // ==== PUBG categories ====
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

  // ==== Helpers ====
  function proxyLine(h,p){ return "SOCKS5 "+h+":"+p; }
  function matchDomain(h,list){ for (var i=0;i<list.length;i++){ var p=list[i]; if (p.indexOf("*")>=0){ if (shExpMatch(h,p)) return true; } else { if (dnsDomainIs(h,p)) return true; } } return false; }
  function matchURL(u,patterns){ for (var i=0;i<patterns.length;i++){ if (shExpMatch(u,patterns[i])) return true; } return false; }
  function inCategory(cat){ return matchDomain(host,PUBG_DOMAINS[cat]) || matchURL(url,URL_PATTERNS[cat]); }
  function baseDomain(h){ var s=h.split("."); return s.length<=2?h:s.slice(s.length-2).join("."); }
  function nowMin(){ return Math.floor((new Date()).getTime()/60000); }
  function epochSeed(){ return Math.floor(nowMin()/EPOCH_MINUTES); }

  // IPv6
  function isIPv6(ip){ return ip && ip.indexOf(":")>=0; }
  function expandIPv6(a){ if(!a)return""; if(a.indexOf("::")>=0){var s=a.split("::"),l=s[0]?s[0].split(":"):[],r=s[1]?s[1].split(":"):[],m=8-(l.length+r.length);while(m-->0)l.push("0");a=l.concat(r).join(":");} return a.split(":").map(function(x){return("0000"+x).slice(-4)}).join(":"); }
  function ipv6Hex(ip){ return expandIPv6(ip).replace(/:/g,"").toLowerCase(); }
  function inCidrV6(ip,cidr){ var p=cidr.split("/"),b=parseInt(p[1]||"128",10); var h=ipv6Hex(ip),ph=ipv6Hex(p[0]); var n=Math.floor(b/4); if(h.substring(0,n)!==ph.substring(0,n)) return false; if(b%4===0) return true; var m=(0xF<<(4-(b%4)))&0xF; return (parseInt(h.charAt(n),16)&m)===(parseInt(ph.charAt(n),16)&m); }

  // IPv4
  function isIPv4(ip){ return ip && ip.indexOf(".")>=0 && ip.indexOf(":")<0; }
  function ip4ToInt(ip){ var p=ip.split("."); return ((+p[0]<<24)>>>0)+((+p[1]<<16)>>>0)+((+p[2]<<8)>>>0)+(+p[3]>>>0); }
  function inCidrV4(ip,cidr){ var a=cidr.split("/"); var b=parseInt(a[1]||"32",10); var i=ip4ToInt(ip), bi=ip4ToInt(a[0]); var m=b===0?0:((0xFFFFFFFF<<(32-b))>>>0); return (i&m)===(bi&m); }

  // Prefix checks
  function isInPrefixes(ip,v4,v6){ if(!ip) return false; if(isIPv4(ip)){ for(var i=0;i<v4.length;i++) if(inCidrV4(ip,v4[i])) return true; } else { for(var j=0;j<v6.length;j++) if(inCidrV6(ip,v6[j])) return true; } return false; }
  function isResidentialJO(ip){ return isInPrefixes(ip, RES_V4, RES_V6); }

  // Weighted hashing (للتنويع الثابت داخل الإبوك)
  function sum32(s, salt){ var h=0; for(var i=0;i<s.length;i++){ h=(h*131 + s.charCodeAt(i) + (salt||0))>>>0; } return h>>>0; }
  function pickWeighted(pool, seed){
    var total=0; for(var i=0;i<pool.length;i++) total+= (pool[i].weight||1);
    var r = seed % total; if (r<0) r += total;
    var acc=0; for(var j=0;j<pool.length;j++){ acc += (pool[j].weight||1); if (r<acc) return j; }
    return 0;
  }

  // اختيار حسب مزوّد الوجهة إن أمكن
  function pickISPByDest(ip){
    if(!ip) return DEFAULT_EGRESS_IDX;
    for(var i=0;i<JO_EGRESS.length;i++){ if(isInPrefixes(ip, JO_EGRESS[i].v4, JO_EGRESS[i].v6)) return i; }
    return DEFAULT_EGRESS_IDX;
  }

  // Sticky per baseDomain داخل الإبوك
  if (typeof _stickyCache === "undefined") var _stickyCache = {};
  function stickyKey(h){ return baseDomain(h)+"|E"+epochSeed(); }
  function stickyGet(h){ var k=stickyKey(h); var e=_stickyCache[k]; if(!e) return null; if (nowMin()-e.t > STICKY_MINUTES) return null; return e.v; }
  function stickyPut(h,val){ _stickyCache[stickyKey(h)] = {t: nowMin(), v: val}; }

  // Quick outs
  if (matchDomain(host, YOUTUBE_DOMAINS)) return "DIRECT";

  // Resolve
  var destIP = dnsResolve(host);
  var seedBase = baseDomain(host) + "|" + epochSeed();

  // Cache?
  var cached = stickyGet(host);
  if (cached) return cached.line;

  // 1) DIRECT فقط لو الوجهة سكني أردني
  if (isResidentialJO(destIP)){
    stickyPut(host, {line:"DIRECT"});
    return "DIRECT";
  }

  // 2) اختيار المخرج:
  //    - إن عُرف مزوّد الوجهة → خذه
  //    - غير ذلك → تنويع موزون لصالح السكني
  var ispIdx = pickISPByDest(destIP);
  if (ispIdx === DEFAULT_EGRESS_IDX) {
    var salt = (matchDomain(host,PUBG_DOMAINS.RECRUIT_SEARCH) || matchURL(url,URL_PATTERNS.RECRUIT_SEARCH)) ? RECRUIT_SALT_OFFSET : 0;
    var seed = sum32(seedBase, salt);
    ispIdx = pickWeighted(JO_EGRESS, seed);
  }
  var ISP = JO_EGRESS[ispIdx];

  // خطوط البروكسي
  function lineGAME(){ return proxyLine(ISP.proxyHost, ISP.ports.GAME); }
  function lineUPD(){  return proxyLine(ISP.proxyHost, ISP.ports.UPD ); }
  function lineCDN(){  return proxyLine(ISP.proxyHost, ISP.ports.CDN ); }

  // 3) قرارات PUBG — توحيد الإيغرِس داخل الإبوك
  var line;
  if (matchDomain(host,PUBG_DOMAINS.MATCH) || matchURL(url,URL_PATTERNS.MATCH)) {
    line = lineGAME();
  } else if (matchDomain(host,PUBG_DOMAINS.RECRUIT_SEARCH) || matchURL(url,URL_PATTERNS.RECRUIT_SEARCH)) {
    line = lineGAME();
  } else if (matchDomain(host,PUBG_DOMAINS.LOBBY) || matchURL(url,URL_PATTERNS.LOBBY)) {
    line = lineGAME();
  } else if (matchURL(url,URL_PATTERNS.UPDATES) || matchDomain(host,CDN_DOMAINS) || matchURL(url,URL_PATTERNS.CDNs)) {
    line = lineCDN();
  } else {
    line = lineGAME();
  }

  stickyPut(host, {line: line, isp: ISP.name});
  return line;
}
