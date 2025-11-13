 function FindProxyForURL(url, host) {
  // STRICT_JO_ROUTERS_v6 (Geo/RDAP) — live-built + MODES + AREAS /56
  // MODES: "COZY", "HUNT", "HUNT_DEEP"
  var MODE = "HUNT_DEEP";

  var JO_PROXY_HOST = "127.0.0.1";
  var PORT_LOBBY = 10010;
  var PORT_MATCH = 20001;
  var PORT_RECRUIT_SEARCH = 12000;
  var PORT_UPDATES = 8080;
  var PORT_CDN = 443;
  var STICKY_MINUTES = 10;

  // مناطق/أحياء IPv6 أردنية (/ 56) مدموجة ونظيفة (بدون ff00)
  var JO_V6_PREFIXES = ["2a03:6b00::/29"];

  function proxyLine(port){ return "SOCKS5 " + JO_PROXY_HOST + ":" + port; }
  function matchDomain(h,l){for(var i=0;i<l.length;i++){var p=l[i];if(p.indexOf("*")>=0){if(shExpMatch(h,p))return true;}else{if(dnsDomainIs(h,p))return true;}}return false;}
  function matchURL(u,ps){for(var i=0;i<ps.length;i++){if(shExpMatch(u,ps[i]))return true;}return false;}

  var PUBG_DOMAINS = {
    LOBBY:["*.pubgmobile.com","*.pubgmobile.net","*.proximabeta.com","*.igamecj.com"],
    MATCH:["*.gcloud.qq.com","gpubgm.com","*.igamecj.com","*.proximabeta.com"],
    RECRUIT_SEARCH:["match.igamecj.com","match.proximabeta.com","teamfinder.igamecj.com","teamfinder.proximabeta.com","clan.igamecj.com"],
    UPDATES:["cdn.pubgmobile.com","updates.pubgmobile.com","patch.igamecj.com","hotfix.proximabeta.com","dlied1.qq.com","dlied2.qq.com"],
    CDNs:["cdn.igamecj.com","cdn.proximabeta.com","cdn.tencentgames.com","*.qcloudcdn.com","*.cloudfront.net","*.edgesuite.net"]
  };
  var URL_PATTERNS = {
    LOBBY:["*/account/login*","*/client/version*","*/status/heartbeat*","*/presence/*","*/friends/*"],
    MATCH:["*/matchmaking/*","*/mms/*","*/game/start*","*/game/join*","*/report/battle*"],
    RECRUIT_SEARCH:["*/teamfinder/*","*/clan/*","*/social/*","*/search/*","*/recruit/*"],
    UPDATES:["*/patch*","*/update*","*/hotfix*","*/download/*","*/assets/*","*/assetbundle*","*/obb*"],
    CDNs:["*/cdn/*","*/image/*","*/media/*","*/video/*","*/res/*","*/pkg/*"]
  };

  function expandIPv6(addr){
    if(!addr)return"";
    if(addr.indexOf("::")>=0){
      var sides=addr.split("::");
      var left=sides[0]?sides[0].split(":"):[];
      var right=sides[1]?sides[1].split(":"):[];
      var missing=8-(left.length+right.length);
      var mid=[];for(var i=0;i<missing;i++)mid.push("0");
      var full=left.concat(mid,right);
      for(var j=0;j<full.length;j++)full[j]=("0000"+(full[j]||"0")).slice(-4);
      return full.join(":");
    }else{
      return addr.split(":").map(function(x){return("0000"+x).slice(-4);}).join(":");
    }
  }
  function ipv6Hex(ip){return expandIPv6(ip).replace(/:/g,"").toLowerCase();}
  function inCidrV6(ip,cidr){
    var parts=cidr.split("/"); var pref=parts[0]; var bits=parts.length>1?parseInt(parts[1],10):128;
    var ipHex=ipv6Hex(ip); var prefHex=ipv6Hex(pref);
    var nibbles=Math.floor(bits/4);
    if(ipHex.substring(0,nibbles)!==prefHex.substring(0,nibbles))return false;
    if(bits%4===0)return true;
    var maskBits=bits%4; var mask=(0xF<<(4-maskBits))&0xF;
    var ipNib=parseInt(ipHex.charAt(nibbles),16)&mask;
    var pfNib=parseInt(prefHex.charAt(nibbles),16)&mask;
    return ipNib===pfNib;
  }
  function isJOv6(ip){
    if(!ip||ip.indexOf(":")<0) return false;
    for (var i=0;i<JO_V6_PREFIXES.length;i++){ if(inCidrV6(ip, JO_V6_PREFIXES[i])) return true; }
    return false;
  }

  if(typeof _stickyCache==="undefined"){var _stickyCache={};}
  function nowMin(){return Math.floor((new Date()).getTime()/60000);}
  function stickyGet(h){var e=_stickyCache[h];if(!e)return null;if(nowMin()-e.t>STICKY_MINUTES)return null;return e.v;}
  function stickyPut(h,v){_stickyCache[h]={t:nowMin(),v:v};}

  var YT=["youtube.com","youtu.be","googlevideo.com","ytimg.com","youtube-nocookie.com"];
  if (matchDomain(host,YT)) return "DIRECT";

  var cached = stickyGet(host);
  if (cached) return cached;

  var ip = dnsResolve(host);
  var jo = isJOv6(ip);

  function decStrict(port){
    if (jo) {
      stickyPut(host,"DIRECT");
      return "DIRECT";
    }
    var l = proxyLine(port);
    stickyPut(host,l);
    return l;
  }

  function decBalanced(port){
    if (jo) {
      stickyPut(host,"DIRECT");
      return "DIRECT";
    }
    var l = proxyLine(port);
    stickyPut(host,l);
    return l;
  }

  function decCozy(port){
    if (jo) {
      stickyPut(host,"DIRECT");
      return "DIRECT";
    }
    var l = proxyLine(port);
    stickyPut(host,l);
    return l;
  }

  function chooseModeDec(port){
    if (MODE === "HUNT_DEEP") return decStrict(port);
    if (MODE === "HUNT") return decBalanced(port);
    return decCozy(port);
  }

  if (matchDomain(host,PUBG_DOMAINS.MATCH) || matchURL(url,URL_PATTERNS.MATCH)) {
    return chooseModeDec(20001);
  }
  if (matchDomain(host,PUBG_DOMAINS.RECRUIT_SEARCH) || matchURL(url,URL_PATTERNS.RECRUIT_SEARCH)) {
    return chooseModeDec(12000);
  }
  if (matchDomain(host,PUBG_DOMAINS.LOBBY) || matchURL(url,URL_PATTERNS.LOBBY)) {
    return chooseModeDec(10010);
  }

  if (matchDomain(host,PUBG_DOMAINS.UPDATES) || matchURL(url,URL_PATTERNS.UPDATES)) {
    if (jo) {
      stickyPut(host,"DIRECT");
      return "DIRECT";
    }
    var u = proxyLine(8080);
    stickyPut(host,u);
    return u;
  }
  if (matchDomain(host,PUBG_DOMAINS.CDNs) || matchURL(url,URL_PATTERNS.CDNs)) {
    if (jo) {
      stickyPut(host,"DIRECT");
      return "DIRECT";
    }
    var d = proxyLine(443);
    stickyPut(host,d);
    return d;
  }

  if (jo) {
    stickyPut(host,"DIRECT");
    return "DIRECT";
  }
  var fb = proxyLine(10010);
  stickyPut(host,fb);
  return fb;
}
