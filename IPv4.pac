function FindProxyForURL(url, host) {
  // STRICT_JO_PLUS (IPv4) — generated
  var JO_PROXY_HOST = "127.0.0.1";
  var PORT_LOBBY = 10012;
  var PORT_MATCH = 20001;
  var PORT_RECRUIT_SEARCH = 12000;
  var PORT_UPDATES = 8080;
  var PORT_CDN = 443;
  var STICKY_MINUTES = 10;

  var JO_V4_PREFIXES = [
    "5.45.128.0/20",
    "37.17.192.0/20",
    "37.123.64.0/19",
    "37.202.64.0/18",
    "37.220.112.0/20",
    "46.23.112.0/23",
    "46.23.115.0/24",
    "46.32.96.0/24",
    "46.32.98.0/24",
    "46.32.100.0/23",
    "46.32.121.0/24",
    "46.32.122.0/24",
    "46.185.128.0/17",
    "46.248.192.0/19",
    "62.72.160.0/20",
    "77.245.2.0/24",
    "77.245.4.0/22",
    "77.245.13.0/24",
    "77.245.14.0/24",
    "79.134.128.0/20",
    "79.134.144.0/21",
    "79.173.192.0/18",
    "80.90.160.0/24",
    "80.90.162.0/24",
    "80.90.164.0/23",
    "80.90.167.0/24",
    "80.90.168.0/22",
    "80.90.172.0/23",
    "81.28.112.0/21",
    "81.28.120.0/23",
    "81.28.125.0/24",
    "82.212.64.0/24",
    "82.212.66.0/23",
    "82.212.81.0/24",
    "82.212.82.0/23",
    "82.212.100.0/23",
    "82.212.114.0/24",
    "82.212.116.0/24",
    "82.212.124.0/24",
    "82.212.127.0/24",
    "84.18.32.0/19",
    "84.18.66.0/23",
    "84.18.68.0/22",
    "84.18.72.0/21",
    "84.18.80.0/20",
    "86.108.0.0/23",
    "86.108.5.0/24",
    "86.108.24.0/23",
    "86.108.55.0/24",
    "86.108.56.0/24",
    "86.108.87.0/24",
    "86.108.88.0/24",
    "86.108.122.0/23",
    "86.108.124.0/24",
    "91.186.224.0/19",
    "92.241.32.0/19",
    "92.253.0.0/17",
    "94.142.35.0/24",
    "94.142.38.0/24",
    "94.142.45.0/24",
    "94.142.46.0/23",
    "94.142.58.0/23",
    "94.142.61.0/24",
    "94.249.0.0/19",
    "94.249.32.0/20",
    "94.249.48.0/21",
    "94.249.56.0/22",
    "94.249.64.0/18",
    "95.141.208.0/21",
    "95.172.192.0/20",
    "109.107.224.0/21",
    "109.107.248.0/21",
    "109.237.192.0/20",
    "149.200.128.0/17",
    "176.28.128.0/17",
    "176.29.0.0/16",
    "176.57.0.0/19",
    "176.57.51.0/24",
    "176.57.53.0/24",
    "178.77.128.0/18",
    "178.238.176.0/21",
    "188.123.161.0/24",
    "188.123.163.0/24",
    "188.123.165.0/24",
    "188.123.184.0/23",
    "188.123.187.0/24",
    "188.247.64.0/23",
    "188.247.66.0/24",
    "188.247.70.0/24",
    "193.188.64.0/23",
    "193.188.67.0/24",
    "193.188.68.0/24",
    "193.188.92.0/23",
    "194.165.128.0/23",
    "194.165.132.0/24",
    "194.165.153.0/24",
    "194.165.154.0/24",
    "212.34.1.0/24",
    "212.34.3.0/24",
    "212.34.4.0/24",
    "212.34.25.0/24",
    "212.34.26.0/24",
    "212.35.64.0/19",
    "212.118.0.0/21",
    "212.118.16.0/20",
    "213.139.32.0/19",
    "213.186.160.0/19",
    "217.23.32.0/20",
    "217.29.240.0/20",
    "217.144.0.0/22",
    "217.144.4.0/23",
    "217.144.6.0/24"
  ];

  function proxyLine(port) { return "SOCKS5 " + JO_PROXY_HOST + ":" + port; }
  function matchDomain(host,list){ for(var i=0;i<list.length;i++){ var pat=list[i]; if(pat.indexOf("*")>=0){ if(shExpMatch(host,pat)) return true; } else { if(dnsDomainIs(host,pat)) return true; } } return false; }
  function matchURL(url,patterns){ for(var i=0;i<patterns.length;i++) if(shExpMatch(url,patterns[i])) return true; return false; }

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
  function inCidrV4(ip,cidr){ var parts=cidr.split('/'); var base=parts[0]; var bits=parts.length>1?parseInt(parts[1],10):32; var ipi=ip4ToInt(ip); var bi=ip4ToInt(base); var mask = bits===0?0: (~((1<<(32-bits))-1))>>>0; return (ipi & mask) === (bi & mask); }
  function isJordanIPv4(ip){ if(!ip) return false; for(var i=0;i<JO_V4_PREFIXES.length;i++) if(inCidrV4(ip, JO_V4_PREFIXES[i])) return true; return false; }

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
  function decideForCategory(cat, defaultPort){ if (joV4) { stickyPut(host,"DIRECT"); return "DIRECT"; } var line = proxyLine(defaultPort); stickyPut(host, line); return line; }

  if (inCategory("MATCH")) return decideForCategory("MATCH", PORT_MATCH);
  if (inCategory("RECRUIT_SEARCH")) return decideForCategory("RECRUIT_SEARCH", PORT_RECRUIT_SEARCH);
  if (inCategory("LOBBY")) return decideForCategory("LOBBY", PORT_LOBBY);

  if (inCategory("UPDATES")) { if (joV4) { stickyPut(host,"DIRECT"); return "DIRECT"; } var u = proxyLine(PORT_UPDATES); stickyPut(host,u); return u; }
  if (inCategory("CDNs")) { if (joV4) { stickyPut(host,"DIRECT"); return "DIRECT"; } var c = proxyLine(PORT_CDN); stickyPut(host,c); return c; }

  if (joV4) { stickyPut(host,"DIRECT"); return "DIRECT"; }
  var fb = proxyLine(PORT_LOBBY); stickyPut(host, fb); return fb;
}
