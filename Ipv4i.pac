function FindProxyForURL(url, host) {
  // STRICT_JO_ONLY for lobby/recruit/match
  var JO_PROXY_HOST = "127.0.0.1";
  var PORT_LOBBY = 10012;           // لوجي
  var PORT_MATCH = 20001;           // مباراة
  var PORT_RECRUIT_SEARCH = 12000;  // تجنيد/بحث
  var PORT_UPDATES = 8080;          // تحديثات
  var PORT_CDN = 443;               // CDN
  var STICKY_MINUTES = 10;

  // القائمة التي زودتني بها (أي إدخال بدون / يعامل /32)
  var JO_V4_PREFIXES = [
    "46.248.219.127","86.108.116.10","86.108.121.132","91.186.251.130","188.247.83.130",
    "81.28.121.190","81.28.121.194","46.185.161.226","217.29.254.65","176.29.90.2",
    "213.139.54.66","188.247.66.226","213.139.54.63","176.29.197.150","79.173.239.1",
    "176.29.197.155","86.108.16.132","46.185.175.63","86.108.36.130","86.108.96.130",
    "176.29.207.211","86.108.56.134","46.185.175.65","176.28.205.3","176.29.205.2",
    "176.29.207.218","176.29.105.6","176.29.105.5","77.245.14.192","149.200.250.63",
    "37.202.123.101","212.35.88.132","94.249.120.160","176.28.219.6","176.29.106.226",
    "176.29.43.6","79.173.219.63","46.185.202.251","149.200.242.126","176.29.112.16",
    "46.185.142.193","95.172.209.252","109.107.244.132","217.29.242.130","217.29.242.132",
    "91.186.250.2","176.29.180.30","212.118.27.194","212.118.27.190","176.28.206.194",
    "79.173.216.10","176.29.207.92","176.29.111.1","46.32.96.253","176.28.206.193",
    "46.32.96.251","86.108.112.62","92.253.65.63","92.253.65.62","92.241.45.62",
    "46.185.152.195","217.23.36.224","92.241.45.63","217.144.6.226","217.23.36.226",
    "92.253.25.64","92.253.65.64","92.253.55.64","213.186.168.99","178.77.162.62",
    "46.185.221.2","176.28.162.64","149.200.150.132","176.28.231.9","176.28.131.4",
    "176.29.231.5","176.28.131.2","178.77.131.3","81.28.120.130","149.200.157.100",
    "149.200.162.194","149.200.162.193","92.253.92.128","92.253.92.129","92.253.52.128",
    "92.241.32.129","92.241.52.126","92.241.52.127","92.253.42.127","95.141.208.101",
    "95.141.208.100","149.200.227.65","176.28.216.10","46.185.245.150","212.118.26.100",
    "79.173.216.225","79.173.216.224","188.123.189.150","109.107.250.251","109.107.250.253",
    "46.248.217.254","176.57.55.30","176.29.45.31","176.29.65.31","176.29.25.30",
    "176.29.75.31","193.188.65.225","46.185.204.194","46.248.204.190","86.108.74.65",
    "86.108.84.64","109.107.247.99","86.108.64.66","213.139.33.126","86.108.24.66",
    "86.108.14.63","86.108.64.62","86.108.54.64","86.108.64.63","86.108.14.62",
    "86.108.34.62","86.108.44.62","86.108.24.63","212.35.70.64","212.118.0.65",
    "176.28.179.10","46.185.141.31","109.107.247.254","149.200.224.64","109.107.247.253",
    "82.212.112.251","188.123.181.195","193.188.67.63","79.173.246.128","79.173.233.101",
    "91.106.109.65","149.200.194.9","178.238.186.132","46.185.128.100","91.106.110.31",
    "149.200.194.2","178.77.189.251","176.28.189.252","176.28.189.253","176.29.189.254",
    "109.107.249.193","178.77.189.252","86.108.56.29","86.108.56.22","79.173.213.4",
    "213.186.183.253","46.185.209.30"
  ];

  function proxyLine(port){ return "SOCKS5 " + JO_PROXY_HOST + ":" + port; }
  function blockLine(){ return "PROXY 0.0.0.0:0"; } // يوقف الاتصال لغير الأردني
  function matchDomain(host,list){ for (var i=0;i<list.length;i++){ var p=list[i]; if(p.indexOf("*")>=0){ if(shExpMatch(host,p)) return true; } else { if(dnsDomainIs(host,p)) return true; } } return false; }
  function matchURL(url,patterns){ for (var i=0;i<patterns.length;i++) if(shExpMatch(url,patterns[i])) return true; return false; }

  var PUBG_DOMAINS = {
    LOBBY: ["*.pubgmobile.com","*.pubgmobile.net","*.proximabeta.com","*.igamecj.com"],
    MATCH: ["*.gcloud.qq.com","gpubgm.com","*.igamecj.com","*.proximabeta.com"],
    RECRUIT_SEARCH: ["match.igamecj.com","match.proximabeta.com","teamfinder.igamecj.com","teamfinder.proximabeta.com","clan.igamecj.com"],
    UPDATES: ["cdn.pubgmobile.com","updates.pubgmobile.com","patch.igamecj.com","hotfix.proximabeta.com","dlied1.qq.com","dlied2.qq.com"],
    CDNs: ["cdn.igamecj.com","cdn.proximabeta.com","cdn.tencentgames.com","*.qcloudcdn.com","*.cloudfront.net","*.edgesuite.net"]
  };
  var URL_PATTERNS = {
    LOBBY: ["*/account/login*","*/client/version*","*/status/heartbeat*","*/presence/*","*/friends/*"],
    MATCH: ["*/matchmaking/*","*/mms/*","*/game/start*","*/game/join*","*/report/battle*"],
    RECRUIT_SEARCH: ["*/teamfinder/*","*/clan/*","*/social/*","*/search/*","*/recruit/*"],
    UPDATES: ["*/patch*","*/update*","*/hotfix*","*/download*","*/assets/*","*/assetbundle*","*/obb*"],
    CDNs: ["*/cdn/*","*/image/*","*/media/*","*/video/*","*/res/*","*/pkg/*"]
  };

  function ip4ToInt(ip){ var p=ip.split('.'); return ((p[0]<<24)>>>0) + (p[1]<<16) + (p[2]<<8) + (p[3]>>>0); }
  function inCidrV4(ip,cidr){
    var parts=cidr.split('/'); var base=parts[0]; var bits=parts.length>1?parseInt(parts[1],10):32;
    var ipi=ip4ToInt(ip); var bi=ip4ToInt(base);
    var mask = bits===0?0: (~((1<<(32-bits))-1))>>>0;
    return (ipi & mask) === (bi & mask);
  }
  function isJordanIPv4(ip){
    if(!ip) return false;
    for (var i=0;i<JO_V4_PREFIXES.length;i++) if(inCidrV4(ip, JO_V4_PREFIXES[i])) return true;
    return false;
  }

  // Sticky cache
  if (typeof _stickyCache === "undefined") { var _stickyCache = {}; }
  function nowMin(){ return Math.floor((new Date()).getTime() / 60000); }
  function stickyGet(h){ var e=_stickyCache[h]; if(!e) return null; if (nowMin()-e.t > STICKY_MINUTES) return null; return e.v; }
  function stickyPut(h,v){ _stickyCache[h] = {t: nowMin(), v: v}; }

  // Quick outs
  var YT = ["youtube.com","youtu.be","googlevideo.com","ytimg.com","youtube-nocookie.com"];
  if (matchDomain(host, YT)) return "DIRECT";

  var cached = stickyGet(host);
  if (cached) return cached;

  var destIP = dnsResolve(host);
  var joV4 = isJordanIPv4(destIP);

  function inCategory(cat){ return matchDomain(host,PUBG_DOMAINS[cat]) || matchURL(url, URL_PATTERNS[cat]); }

  // ——— STRICT: الأردني فقط للمباريات/التجنيد/اللوبي ———
  if (inCategory("MATCH") || inCategory("RECRUIT_SEARCH") || inCategory("LOBBY")) {
    if (joV4) { stickyPut(host, "DIRECT"); return "DIRECT"; }
    var blk = blockLine(); stickyPut(host, blk); return blk; // غير أردني؟ اقطع
  }

  // باقي الفئات كما هي
  if (inCategory("UPDATES")) { if (joV4) { stickyPut(host,"DIRECT"); return "DIRECT"; } var u = proxyLine(PORT_UPDATES); stickyPut(host,u); return u; }
  if (inCategory("CDNs"))    { if (joV4) { stickyPut(host,"DIRECT"); return "DIRECT"; } var c = proxyLine(PORT_CDN);     stickyPut(host,c); return c; }

  // افتراضي: أردني DIRECT، غير هيك اقطع
  if (joV4) { stickyPut(host,"DIRECT"); return "DIRECT"; }
  var fb = blockLine(); stickyPut(host, fb); return fb;
}
