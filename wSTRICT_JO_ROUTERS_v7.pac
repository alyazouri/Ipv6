function FindProxyForURL(url, host) {
  // STRICT_JO_ROUTERS_v6 (Geo/RDAP) — live-built, aggregated to /56
  var JO_PROXY_HOST = "127.0.0.1";
  var PORT_LOBBY = 10010;
  var PORT_MATCH = 20001;
  var PORT_RECRUIT_SEARCH = 12000;
  var PORT_UPDATES = 8080;
  var PORT_CDN = 443;
  var STICKY_MINUTES = 10;

  var JO_V6_PREFIXES = [
    "2001:32c0::/56",
    "2001:32c0:1000::/56",
    "2001:32c0:1fff:ff00::/56",
    "2001:32c0:2fff:ff00::/56",
    "2001:32c0:3fff:ff00::/56",
    "2001:32c0:4fff:ff00::/56",
    "2001:32c0:5fff:ff00::/56",
    "2001:32c0:6fff:ff00::/56",
    "2001:32c0:7fff:ff00::/56",
    "2001:32c0:8fff:ff00::/56",
    "2001:32c0:9fff:ff00::/56",
    "2001:32c0:afff:ff00::/56",
    "2001:32c0:bfff:ff00::/56",
    "2001:32c0:cfff:ff00::/56",
    "2001:32c0:dfff:ff00::/56",
    "2001:32c0:efff:ff00::/56",
    "2001:32c0:ffff:ff00::/56",
    "2001:32c1::/56",
    "2001:32c1:4fff:ff00::/56",
    "2001:32c1:bfff:ff00::/56",
    "2001:32c2::/56",
    "2001:32c2:1000::/56",
    "2001:32c2:5fff:ff00::/56",
    "2001:32c3::/56",
    "2001:32c3:1000::/56",
    "2001:32c3:1fff:ff00::/56",
    "2001:32c3:2fff:ff00::/56",
    "2001:32c3:3fff:ff00::/56",
    "2001:32c3:4fff:ff00::/56",
    "2001:32c3:5fff:ff00::/56",
    "2001:32c3:6fff:ff00::/56",
    "2001:32c3:7fff:ff00::/56",
    "2001:32c3:8fff:ff00::/56",
    "2001:32c3:9fff:ff00::/56",
    "2001:32c3:afff:ff00::/56",
    "2001:32c3:bfff:ff00::/56",
    "2001:32c3:cfff:ff00::/56",
    "2001:32c3:dfff:ff00::/56",
    "2001:32c3:efff:ff00::/56",
    "2001:32c3:ffff:ff00::/56",
    "2001:32c4::/56",
    "2001:32c5::/56",
    "2001:32c5:1000::/56",
    "2001:32c5:1fff:ff00::/56",
    "2001:32c5:2fff:ff00::/56",
    "2001:32c5:3fff:ff00::/56",
    "2001:32c5:4fff:ff00::/56",
    "2001:32c5:5fff:ff00::/56",
    "2001:32c5:7fff:ff00::/56",
    "2001:32c5:8fff:ff00::/56",
    "2001:32c5:9fff:ff00::/56",
    "2001:32c5:afff:ff00::/56",
    "2001:32c5:bfff:ff00::/56",
    "2001:32c5:dfff:ff00::/56",
    "2001:32c5:efff:ff00::/56",
    "2001:32c5:ffff:ff00::/56",
    "2001:32c6::/56",
    "2001:32c6:1000::/56",
    "2001:32c6:1fff:ff00::/56",
    "2001:32c6:2fff:ff00::/56",
    "2001:32c6:3fff:ff00::/56",
    "2001:32c6:4fff:ff00::/56",
    "2001:32c6:5fff:ff00::/56",
    "2001:32c6:6fff:ff00::/56",
    "2001:32c6:7fff:ff00::/56",
    "2001:32c6:8fff:ff00::/56",
    "2001:32c6:9fff:ff00::/56",
    "2001:32c6:afff:ff00::/56",
    "2001:32c6:bfff:ff00::/56",
    "2001:32c6:cfff:ff00::/56",
    "2001:32c6:efff:ff00::/56",
    "2001:32c6:ffff:ff00::/56",
    "2001:32c7::/56",
    "2001:32c7:1000::/56",
    "2001:32c7:1fff:ff00::/56",
    "2001:32c7:3fff:ff00::/56",
    "2001:32c7:4fff:ff00::/56",
    "2001:32c7:5fff:ff00::/56",
    "2001:32c7:6fff:ff00::/56",
    "2001:32c7:7fff:ff00::/56",
    "2001:32c7:8fff:ff00::/56",
    "2001:32c7:9fff:ff00::/56",
    "2001:32c7:afff:ff00::/56",
    "2001:32c7:bfff:ff00::/56",
    "2001:32c7:cfff:ff00::/56",
    "2001:32c7:dfff:ff00::/56",
    "2001:32c7:efff:ff00::/56",
    "2001:32c7:ffff:ff00::/56",
    "2a00:18d8:1fff:ff00::/56",
    "2a00:18db::/56",
    "2a00:18db:4fff:ff00::/56",
    "2a00:18db:8fff:ff00::/56",
    "2a00:18df::/56",
    "2a00:18df:dfff:ff00::/56",
    "2a00:caa0::/56",
    "2a00:caa0:9fff:ff00::/56",
    "2a03:6b00::/56",
    "2a03:6b00:1000::/56",
    "2a03:6b00:1fff:ff00::/56",
    "2a03:6b00:2fff:ff00::/56",
    "2a03:6b00:3fff:ff00::/56",
    "2a03:6b00:4fff:ff00::/56",
    "2a03:6b00:5fff:ff00::/56",
    "2a03:6b00:6fff:ff00::/56",
    "2a03:6b00:7fff:ff00::/56",
    "2a03:6b00:8fff:ff00::/56",
    "2a03:6b00:9fff:ff00::/56",
    "2a03:6b00:afff:ff00::/56",
    "2a03:6b00:bfff:ff00::/56",
    "2a03:6b00:cfff:ff00::/56",
    "2a03:6b00:dfff:ff00::/56",
    "2a03:6b00:efff:ff00::/56",
    "2a03:6b00:ffff:ff00::/56",
    "2a03:6b01::/56",
    "2a03:6b02::/56",
    "2a03:6b02:1000::/56",
    "2a03:6b02:1fff:ff00::/56",
    "2a03:6b02:2fff:ff00::/56",
    "2a03:6b02:3fff:ff00::/56",
    "2a03:6b02:4fff:ff00::/56",
    "2a03:6b02:5fff:ff00::/56",
    "2a03:6b02:6fff:ff00::/56",
    "2a03:6b02:7fff:ff00::/56",
    "2a03:6b02:8fff:ff00::/56",
    "2a03:6b02:9fff:ff00::/56",
    "2a03:6b02:afff:ff00::/56",
    "2a03:6b02:bfff:ff00::/56",
    "2a03:6b02:cfff:ff00::/56",
    "2a03:6b02:dfff:ff00::/56",
    "2a03:6b02:efff:ff00::/56",
    "2a03:6b02:ffff:ff00::/56",
    "2a03:6b03::/56",
    "2a03:6b03:1000::/56",
    "2a03:6b03:1fff:ff00::/56",
    "2a03:6b03:2fff:ff00::/56",
    "2a03:6b03:3fff:ff00::/56",
    "2a03:6b03:4fff:ff00::/56",
    "2a03:6b03:5fff:ff00::/56",
    "2a03:6b03:6fff:ff00::/56",
    "2a03:6b03:7fff:ff00::/56",
    "2a03:6b03:8fff:ff00::/56",
    "2a03:6b03:9fff:ff00::/56",
    "2a03:6b03:afff:ff00::/56",
    "2a03:6b03:bfff:ff00::/56",
    "2a03:6b03:cfff:ff00::/56",
    "2a03:6b03:dfff:ff00::/56",
    "2a03:6b03:efff:ff00::/56",
    "2a03:6b03:ffff:ff00::/56",
    "2a03:6b04::/56",
    "2a03:6b05::/56",
    "2a03:6b05:1000::/56",
    "2a03:6b05:1fff:ff00::/56",
    "2a03:6b05:2fff:ff00::/56",
    "2a03:6b05:3fff:ff00::/56",
    "2a03:6b05:4fff:ff00::/56",
    "2a03:6b05:5fff:ff00::/56",
    "2a03:6b05:6fff:ff00::/56",
    "2a03:6b05:7fff:ff00::/56",
    "2a03:6b05:8fff:ff00::/56",
    "2a03:6b05:9fff:ff00::/56",
    "2a03:6b05:afff:ff00::/56",
    "2a03:6b05:bfff:ff00::/56",
    "2a03:6b05:cfff:ff00::/56",
    "2a03:6b05:dfff:ff00::/56",
    "2a03:6b05:efff:ff00::/56",
    "2a03:6b05:ffff:ff00::/56",
    "2a03:6b06::/56",
    "2a03:6b06:dfff:ff00::/56",
    "2a03:6b07::/56",
    "2a03:6b07:8fff:ff00::/56"
  ];

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
    var parts=cidr.split("/"); var pref=parts[0]; var bits=parseInt(parts[1],10);
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

  var c=stickyGet(host);
  if (c) return c;

  var ip=dnsResolve(host);
  var jo=isJOv6(ip);

  function dec(port){
    if (jo){ stickyPut(host,"DIRECT"); return "DIRECT"; }
    var l=proxyLine(port); stickyPut(host,l); return l;
  }

  if (matchDomain(host,PUBG_DOMAINS.MATCH) || matchURL(url,URL_PATTERNS.MATCH)) return dec(20001);
  if (matchDomain(host,PUBG_DOMAINS.RECRUIT_SEARCH) || matchURL(url,URL_PATTERNS.RECRUIT_SEARCH)) return dec(12000);
  if (matchDomain(host,PUBG_DOMAINS.LOBBY) || matchURL(url,URL_PATTERNS.LOBBY)) return dec(10010);

  if (matchDomain(host,PUBG_DOMAINS.UPDATES) || matchURL(url,URL_PATTERNS.UPDATES)) {
    if (jo){ stickyPut(host,"DIRECT"); return "DIRECT"; }
    var u=proxyLine(8080); stickyPut(host,u); return u;
  }
  if (matchDomain(host,PUBG_DOMAINS.CDNs) || matchURL(url,URL_PATTERNS.CDNs)) {
    if (jo){ stickyPut(host,"DIRECT"); return "DIRECT"; }
    var d=proxyLine(443); stickyPut(host,d); return d;
  }

  if (jo) {
    stickyPut(host,"DIRECT");
    return "DIRECT";
  }
  var fb=proxyLine(10010);
  stickyPut(host,fb);
  return fb;
}