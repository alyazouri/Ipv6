function FindProxyForURL(url, host) {
  // ==============================
  // STRICT_JO_PLUS — unified IPv4+IPv6 Jordan-only routing
  // ==============================
  var JO_PROXY_HOST = "127.0.0.1";
  var PORT_GAME      = 20001; // لوجي + مباراة + تجنيد (موحّد)
  var PORT_UPDATES   = 8080;  // تحديثات
  var PORT_CDN       = 443;   // CDN
  var STICKY_MINUTES = 10;

  // ==============================
  // IPv6 الأردن — كاملة
  // ==============================
  var JO_V6_PREFIXES = [
        "2001:32c0::/37",
    "2001:32c0:1000::/38",
    "2001:32c0:3000::/36",
    "2001:32c0:4000::/34",
    "2001:32c0:8000::/33",
    "2001:32c1::/32",
    "2001:32c2::/31",
    "2001:32c4::/30",
    "2a00:18d0::/32",
    "2a00:18d8:800::/38",
    "2a00:18d8:1000::/38",
    "2a00:18d8:1800::/38",
    "2a00:18d8:2400::/38",
    "2a00:18d8:3000::/36",
    "2a00:18d8:4000::/34",
    "2a00:18d8:8000::/33",
    "2a00:18d9::/32",
    "2a00:18da::/31",
    "2a00:18dc::/30",
    "2a03:6b00:1000::/38",
    "2a03:6b00:3000::/36",
    "2a03:6b00:4000::/34",
    "2a03:6b00:8000::/33",
    "2a03:6b01::/32",
    "2a03:6b02::/31",
    "2a03:6b04::/30",
    "2a03:b640:400::/38",
    "2a03:b640:800::/37",
    "2a03:b640:1000::/38",
    "2a03:b640:3000::/36",
    "2a03:b640:4000::/34",
    "2a03:b640:8000::/33"

  ];

  // ==============================
  // IPv4 الأردن — محدثة (Orange + Zain + GO)
  // ==============================
  var JO_V4_PREFIXES = [
    // --- Orange Jordan ---
    "94.249.0.0/17",
    "212.118.0.0/19",

    // --- Zain Jordan ---
    "176.29.0.0/17",
    "213.139.32.0/20",

    // --- GO / Batelco / JDC ---
    "212.35.64.0/19"
  ];

  // ==============================
  // PUBG categories
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
    UPDATES:        ["*/patch*","*/update*","*/hotfix*","*/download*","*/assets/*","*/assetbundle*","*/obb*"]
  };

  // ==============================
  // Helpers
  // ==============================
  function proxyLine(p){ return "SOCKS5 " + JO_PROXY_HOST + ":" + p; }
  function baseDomain(h){ var p=h.split("."); return p.length<=2?h:p.slice(p.length-2).join("."); }
  function isIPv6(ip){ return ip && ip.indexOf(":")>=0; }
  function expandIPv6(a){ if(!a)return""; if(a.indexOf("::")>=0){var s=a.split("::"),l=s[0]?s[0].split(":"):[],r=s[1]?s[1].split(":"):[],m=8-(l.length+r.length);while(m-->0)l.push("0");a=l.concat(r).join(":");}return a.split(":").map(x=>("0000"+x).slice(-4)).join(":");}
  function ipv6Hex(ip){ return expandIPv6(ip).replace(/:/g,""); }
  function inCidrV6(ip,cidr){ var [p,b]=cidr.split("/");b=parseInt(b,10)||128;var h=ipv6Hex(ip),ph=ipv6Hex(p),n=Math.floor(b/4);if(h.substring(0,n)!==ph.substring(0,n))return false;if(b%4===0)return true;var m=(0xF<<(4-(b%4)))&0xF;return (parseInt(h[n],16)&m)===(parseInt(ph[n],16)&m); }
  function isJordanIPv6(ip){ if(!isIPv6(ip))return false; for(var i=0;i<JO_V6_PREFIXES.length;i++) if(inCidrV6(ip,JO_V6_PREFIXES[i])) return true; return false; }
  function isIPv4(ip){ return ip && ip.indexOf(".")>=0 && ip.indexOf(":")<0; }
  function ip4ToInt(ip){ var p=ip.split("."); return ((+p[0]<<24)>>>0)+((+p[1]<<16)>>>0)+((+p[2]<<8)>>>0)+(+p[3]>>>0); }
  function inCidrV4(ip,cidr){ var [b,B]=cidr.split("/");B=parseInt(B,10)||32;var i=ip4ToInt(ip),bi=ip4ToInt(b),m=B===0?0:((0xFFFFFFFF<<(32-B))>>>0);return (i&m)===(bi&m); }
  function isJordanIPv4(ip){ if(!isIPv4(ip))return false; for(var i=0;i<JO_V4_PREFIXES.length;i++) if(inCidrV4(ip,JO_V4_PREFIXES[i])) return true; return false; }

  // Sticky cache
  if(typeof _stickyCache==="undefined") var _stickyCache={};
  function nowMin(){return Math.floor(Date.now()/60000);}
  function stickyKey(h){return baseDomain(h);}
  function stickyGet(h){var k=stickyKey(h),e=_stickyCache[k];return e&&nowMin()-e.t<=STICKY_MINUTES?e.v:null;}
  function stickyPut(h,v){_stickyCache[stickyKey(h)]={t:nowMin(),v:v};}

  // ==============================
  // Core logic
  // ==============================
  var destIP = dnsResolve(host);
  var isJO = isJordanIPv4(destIP) || isJordanIPv6(destIP);
  var cached = stickyGet(host);
  if(cached) return cached;

  function decide(p){ if(isJO){stickyPut(host,"DIRECT");return"DIRECT";} var line=proxyLine(p);stickyPut(host,line);return line;}

  if (isJO) { stickyPut(host,"DIRECT"); return "DIRECT"; }
  if (matchDomain(host,PUBG_DOMAINS.LOBBY) || matchDomain(host,PUBG_DOMAINS.MATCH) || matchDomain(host,PUBG_DOMAINS.RECRUIT_SEARCH))
    return decide(PORT_GAME);
  if (matchURL(url,URL_PATTERNS.UPDATES))
    return decide(PORT_UPDATES);

  return decide(PORT_GAME);
}
