function FindProxyForURL(url, host) {
  // STRICT_JO_ROUTERS_split_cidr (v4+v6) - uses inCidr tests
  var JO_PROXY_HOST = "127.0.0.1";
  var PORT_LOBBY = 10010;
  var PORT_MATCH = 20001;
  var PORT_RECRUIT_SEARCH = 12000;
  var PORT_UPDATES = 8080;
  var PORT_CDN = 443;
  var STICKY_MINUTES = 10;

  var JO_V6_PREFIXES = [
    // (no IPv6 found)
  ];
  var JO_V4_PREFIXES = [
    "176.29.108.20/32",
    "176.29.114.136/32",
    "176.29.114.151/32",
    "176.29.114.166/32",
    "176.29.114.181/32",
    "176.29.114.196/32",
    "176.29.114.200/32",
    "176.29.114.46/32",
    "176.29.114.61/32",
    "176.29.21.16/32",
    "176.29.21.20/32",
    "212.118.0.1/32",
    "212.118.0.2/32",
    "212.118.1.10/32",
    "212.118.1.106/32",
    "212.118.1.20/32",
    "212.118.1.254/32",
    "212.118.1.91/32",
    "212.118.10.254/32",
    "212.118.12.10/32",
    "212.118.12.16/32",
    "212.118.12.196/32",
    "212.118.12.20/32",
    "212.118.12.254/32",
    "212.118.12.61/32",
    "212.118.13.2/32",
    "212.118.13.61/32",
    "212.118.14.2/32",
    "212.118.14.226/32",
    "212.118.16.196/32",
    "212.118.16.200/32",
    "212.118.19.10/32",
    "212.118.19.2/32",
    "212.118.19.31/32",
    "212.118.19.61/32",
    "212.118.2.211/32",
    "212.118.2.91/32",
    "212.118.20.181/32",
    "212.118.20.46/32",
    "212.118.20.61/32",
    "212.118.22.2/32",
    "212.118.23.46/32",
    "212.118.24.10/32",
    "212.118.24.166/32",
    "212.118.26.91/32",
    "212.118.27.136/32",
    "212.118.28.1/32",
    "212.118.28.181/32",
    "212.118.29.2/32",
    "212.118.29.226/32",
    "212.118.30.2/32",
    "212.118.30.50/32",
    "212.118.4.10/32",
    "212.118.4.76/32",
    "212.118.7.50/32",
    "212.118.7.91/32",
    "212.118.8.2/32",
    "212.118.8.20/32",
    "212.118.8.46/32",
    "212.35.64.10/32",
    "212.35.64.106/32",
    "212.35.64.226/32",
    "212.35.65.10/32",
    "212.35.65.181/32",
    "212.35.65.211/32",
    "212.35.65.226/32",
    "212.35.65.76/32",
    "212.35.66.2/32",
    "212.35.66.46/32",
    "212.35.68.91/32",
    "212.35.69.106/32",
    "212.35.70.20/32",
    "212.35.71.226/32",
    "212.35.72.10/32",
    "212.35.72.151/32",
    "212.35.72.211/32",
    "212.35.73.106/32",
    "212.35.73.2/32",
    "212.35.73.20/32",
    "212.35.74.166/32",
    "212.35.76.50/32",
    "212.35.78.2/32",
    "212.35.78.50/32",
    "212.35.79.196/32",
    "212.35.79.211/32",
    "212.35.79.50/32",
    "212.35.84.16/32",
    "212.35.84.20/32",
    "212.35.85.2/32",
    "213.139.38.10/32",
    "213.139.38.16/32",
    "213.139.38.20/32",
    "213.139.38.31/32",
    "213.139.38.76/32",
    "213.139.38.91/32",
    "213.139.41.106/32",
    "213.139.41.254/32",
    "213.139.42.100/32",
    "213.139.42.136/32",
    "213.139.42.166/32",
    "213.139.42.196/32",
    "213.139.43.20/32",
    "213.139.43.31/32",
    "213.139.46.106/32",
    "213.139.46.76/32",
    "213.139.47.1/32",
    "213.139.47.166/32",
    "213.139.47.2/32",
    "213.139.47.31/32",
    "213.139.47.76/32",
    "94.249.112.20/32",
    "94.249.124.76/32",
    "94.249.126.106/32",
    "94.249.126.121/32",
    "94.249.126.200/32",
    "94.249.126.211/32",
    "94.249.126.254/32",
    "94.249.127.181/32",
    "94.249.56.16/32",
    "94.249.59.136/32",
    "94.249.59.200/32",
    "94.249.59.211/32",
    "94.249.59.50/32",
    "94.249.60.100/32",
    "94.249.60.31/32",
    "94.249.61.100/32",
    "94.249.61.166/32",
    "94.249.61.200/32",
    "94.249.61.91/32",
    "94.249.63.166/32",
    "94.249.68.50/32",
    "94.249.71.1/32",
    "94.249.71.10/32",
    "94.249.71.100/32",
    "94.249.71.106/32",
    "94.249.71.121/32",
    "94.249.71.136/32",
    "94.249.71.151/32",
    "94.249.71.16/32",
    "94.249.71.166/32",
    "94.249.71.181/32",
    "94.249.71.196/32",
    "94.249.71.2/32",
    "94.249.71.20/32",
    "94.249.71.200/32",
    "94.249.71.211/32",
    "94.249.71.226/32",
    "94.249.71.31/32",
    "94.249.71.46/32",
    "94.249.71.50/32",
    "94.249.71.76/32",
    "94.249.71.91/32",
    "94.249.75.136/32",
    "94.249.77.20/32",
    "94.249.82.136/32",
    "94.249.82.151/32",
    "94.249.82.2/32",
    "94.249.82.200/32",
    "94.249.83.166/32",
    "94.249.83.181/32",
    "94.249.88.136/32",
    "94.249.88.196/32",
    "94.249.88.200/32",
    "94.249.88.211/32",
    "94.249.88.254/32",
    "94.249.89.10/32",
    "94.249.98.76/32"
  ];

  function proxyLine(port){ return "SOCKS5 " + JO_PROXY_HOST + ":" + port; }
  function matchDomain(h,l){ for (var i=0;i<l.length;i++){ var p=l[i]; if(p.indexOf("*")>=0){ if(shExpMatch(h,p)) return true; } else { if(dnsDomainIs(h,p)) return true; } } return false; }
  function matchURL(u,ps){ for (var i=0;i<ps.length;i++){ if(shExpMatch(u,ps[i])) return true; } return false; }

  // ===== IPv6 helper: expand + compare nibbles =====
  function expandIPv6(addr){
    if(!addr) return "";
    if(addr.indexOf("::")>=0){
      var sides = addr.split("::");
      var left = sides[0]?sides[0].split(":"):[];
      var right = sides[1]?sides[1].split(":"):[];
      var missing = 8 - (left.length + right.length);
      var mid = [];
      for(var i=0;i<missing;i++) mid.push("0");
      var full = left.concat(mid,right);
      for(var j=0;j<full.length;j++) full[j] = ("0000"+(full[j]||"0")).slice(-4);
      return full.join(":");
    } else {
      return addr.split(":").map(function(x){return("0000"+x).slice(-4);}).join(":");
    }
  }
  function ipv6Hex(ip){ return expandIPv6(ip).replace(/:/g,"").toLowerCase(); }
  function inCidrV6(ip, cidr){
    if(!ip || !cidr) return false;
    var parts = cidr.split("/");
    var pref = parts[0];
    var bits = parts.length>1?parseInt(parts[1],10):128;
    var ipHex = ipv6Hex(ip);
    var prefHex = ipv6Hex(pref);
    var nibbles = Math.floor(bits/4);
    if(ipHex.substring(0,nibbles) !== prefHex.substring(0,nibbles)) return false;
    if(bits%4===0) return true;
    var maskBits = bits%4;
    var mask = (0xF << (4-maskBits)) & 0xF;
    var ipNib = parseInt(ipHex.charAt(nibbles),16) & mask;
    var pfNib = parseInt(prefHex.charAt(nibbles),16) & mask;
    return ipNib === pfNib;
  }

  // ===== IPv4 helper: simple int mask test =====
  function ip4ToInt(ip){
    var p = ip.split(".");
    return ((parseInt(p[0],10)<<24)>>>0) + ((parseInt(p[1],10)<<16)>>>0) + ((parseInt(p[2],10)<<8)>>>0) + (parseInt(p[3],10)>>>0);
  }
  function inCidrV4(ip, cidr){
    if(!ip || !cidr) return false;
    var parts = cidr.split("/");
    var pref = parts[0];
    var bits = parts.length>1?parseInt(parts[1],10):32;
    var ipInt = ip4ToInt(ip);
    var prefInt = ip4ToInt(pref);
    var mask = bits===0?0:(((0xFFFFFFFF << (32-bits))>>>0) & 0xFFFFFFFF)>>>0;
    return (ipInt & mask) === (prefInt & mask);
  }

  if (typeof _stickyCache === "undefined"){ var _stickyCache = {}; }
  function nowMin(){ return Math.floor((new Date()).getTime()/60000); }
  function stickyGet(h){ var e=_stickyCache[h]; if(!e) return null; if(nowMin()-e.t>STICKY_MINUTES) return null; return e.v; }
  function stickyPut(h,v){ _stickyCache[h]={t:nowMin(),v:v}; }

  var PUBG_DOMAINS = {
    LOBBY:["*.pubgmobile.com","*.pubgmobile.net","*.proximabeta.com","*.igamecj.com"],
    MATCH:["*.gcloud.qq.com","gpubgm.com","*.igamecj.com","*.proximabeta.com"],
    RECRUIT_SEARCH:["match.igamecj.com","match.proximabeta.com","teamfinder.igamecj.com","teamfinder.proximabeta.com","clan.igamecj.com"],
    UPDATES:["cdn.pubgmobile.com","updates.pubgmobile.com","patch.igamecj.com","hotfix.proximabeta.com","dlied1.qq.com","dlied2.qq.com"],
    CDNs:["cdn.igamecj.com","cdn.proximabeta.com","cdn.tencentgames.com","*.qcloudcdn.com","*.cloudfront.net","*.edgesuite.net"]
  };

  var YT=["youtube.com","youtu.be","googlevideo.com","ytimg.com","youtube-nocookie.com"];
  if (matchDomain(host,YT)) return "DIRECT";

  var c = stickyGet(host); if (c) return c;

  var ip = dnsResolve(host);

  if (ip) {
    if (ip.indexOf(":")>=0) {
      for (var i=0;i<JO_V6_PREFIXES.length;i++){
        try {
          if (inCidrV6(ip, JO_V6_PREFIXES[i])) { stickyPut(host,"DIRECT"); return "DIRECT"; }
        } catch(e){}
      }
    } else {
      for (var j=0;j<JO_V4_PREFIXES.length;j++){
        try {
          if (inCidrV4(ip, JO_V4_PREFIXES[j])) { stickyPut(host,"DIRECT"); return "DIRECT"; }
        } catch(e){}
      }
    }
  }

  function dec(port){
    var l = proxyLine(port);
    stickyPut(host,l);
    return l;
  }

  if (matchDomain(host,PUBG_DOMAINS.MATCH) || matchURL(url,["*/matchmaking/*","*/mms/*"])) return dec(PORT_MATCH);
  if (matchDomain(host,PUBG_DOMAINS.RECRUIT_SEARCH)) return dec(PORT_RECRUIT_SEARCH);
  if (matchDomain(host,PUBG_DOMAINS.LOBBY)) return dec(PORT_LOBBY);

  if (matchDomain(host,PUBG_DOMAINS.UPDATES)) return dec(PORT_UPDATES);
  if (matchDomain(host,PUBG_DOMAINS.CDNs))    return dec(PORT_CDN);

  return dec(PORT_LOBBY);
}