function FindProxyForURL(url, host) {
  // STRICT_JO_ROUTERS_v6 (Geo/RDAP) — live-built
  var JO_PROXY_HOST = "127.0.0.1";
  var PORT_LOBBY = 10010;
  var PORT_MATCH = 20001;
  var PORT_RECRUIT_SEARCH = 12000;
  var PORT_UPDATES = 8080;
  var PORT_CDN = 443;
  var STICKY_MINUTES = 10;

  var JO_V6_PREFIXES = [
    "2a00:18d8:1000::10/128",
    "2a00:18d8:1000::3ff/128",
    "2a00:18d8:1cff:ffff:ffff:ffff:ffff:fff4/128",
    "2a00:18d8:8000::a/128",
    "2a00:18d8:8000::20/128",
    "2a00:18d8:8000::fffe/128",
    "2a00:18d8:8000:1::1/128",
    "2a00:18d8:8000:2::1/128",
    "2a00:18d8:81ff:ffff:ffff:ffff:ffff:ffff/128",
    "2a00:18d8:84ff:ffff:ffff:ffff:ffff:fffc/128",
    "2a00:18d8:88ff:ffff:ffff:ffff:ffff:fff8/128",
    "2a00:18d8:8bff:ffff:ffff:ffff:ffff:fff5/128",
    "2a00:18d8:8dff:ffff:ffff:ffff:ffff:fff3/128",
    "2a00:18d8:8eff:ffff:ffff:ffff:ffff:fff2/128",
    "2a00:18d8:8fff:ffff::1/128",
    "2a00:18da:6000::2/128",
    "2a00:18da:6000::a/128",
    "2a00:18da:6000::10/128",
    "2a00:18da:6000::20/128",
    "2a00:18da:6000::fe/128",
    "2a00:18da:6000::fff/128",
    "2a00:18da:6000::fffe/128",
    "2a00:18da:6000::ffff/128",
    "2a00:18da:6000:1::1/128",
    "2a00:18da:6000:2::1/128",
    "2a00:18da:6100::/128",
    "2a00:18da:63ff:ffff:ffff:ffff:ffff:fffd/128",
    "2a00:18da:64ff:ffff:ffff:ffff:ffff:fffc/128",
    "2a00:18da:65ff:ffff:ffff:ffff:ffff:fffb/128",
    "2a00:18da:66ff:ffff:ffff:ffff:ffff:fffa/128",
    "2a00:18da:69ff:ffff:ffff:ffff:ffff:fff7/128",
    "2a00:18da:6aff:ffff:ffff:ffff:ffff:fff6/128",
    "2a00:18da:6bff:ffff:ffff:ffff:ffff:fff5/128",
    "2a00:18da:6cff:ffff:ffff:ffff:ffff:fff4/128",
    "2a00:18da:6eff:ffff:ffff:ffff:ffff:fff2/128",
    "2a00:18da:6fff:ffff::1/128",
    "2a00:18df:d000::20/128",
    "2a03:6b04:4000::1/128",
    "2a03:6b04:4000::ff/128",
    "2a03:6b04:4000::3ff/128",
    "2a03:6b04:4000::7ff/128",
    "2a03:6b04:4000::fffe/128",
    "2a03:6b04:4000:2::1/128",
    "2a03:6b04:41ff:ffff:ffff:ffff:ffff:ffff/128",
    "2a03:6b04:44ff:ffff:ffff:ffff:ffff:fffc/128",
    "2a03:6b04:47ff:ffff:ffff:ffff:ffff:fff9/128",
    "2a03:6b04:4aff:ffff:ffff:ffff:ffff:fff6/128",
    "2a03:6b04:4cff:ffff:ffff:ffff:ffff:fff4/128",
    "2a03:6b04:4dff:ffff:ffff:ffff:ffff:fff3/128",
    "2a03:6b04:4eff:ffff:ffff:ffff:ffff:fff2/128",
    "2a03:6b04:7000::fffe/128",
    "2a03:6b05:8000::a/128",
    "2a03:6b05:8000::20/128",
    "2a03:6b05:8000::fe/128",
    "2a03:6b05:8000::100/128",
    "2a03:6b05:8000::200/128",
    "2a03:6b05:8000::fff/128",
    "2a03:6b05:8000::ffff/128",
    "2a03:6b05:8000:2::1/128",
    "2a03:6b05:8100::/128",
    "2a03:6b05:82ff:ffff:ffff:ffff:ffff:fffe/128",
    "2a03:6b05:84ff:ffff:ffff:ffff:ffff:fffc/128",
    "2a03:6b05:86ff:ffff:ffff:ffff:ffff:fffa/128",
    "2a03:6b05:87ff:ffff:ffff:ffff:ffff:fff9/128",
    "2a03:6b05:89ff:ffff:ffff:ffff:ffff:fff7/128",
    "2a03:6b05:8bff:ffff:ffff:ffff:ffff:fff5/128",
    "2a03:6b05:8cff:ffff:ffff:ffff:ffff:fff4/128",
    "2a03:6b05:8dff:ffff:ffff:ffff:ffff:fff3/128",
    "2a03:6b05:8eff:ffff:ffff:ffff:ffff:fff2/128",
    "2a03:6b05:8fff:ffff::1/128"
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

  // IPv6 helpers
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

  if(typeof _stickyCache==="undefined"){var _stickyCache={};}function nowMin(){return Math.floor((new Date()).getTime()/60000);}
  function stickyGet(h){var e=_stickyCache[h];if(!e)return null;if(nowMin()-e.t>STICKY_MINUTES)return null;return e.v;}
  function stickyPut(h,v){_stickyCache[h]={t:nowMin(),v:v};}

  var YT=["youtube.com","youtu.be","googlevideo.com","ytimg.com","youtube-nocookie.com"]; if (matchDomain(host,YT)) return "DIRECT";

  var c=stickyGet(host); if (c) return c;
  var ip=dnsResolve(host), jo=isJOv6(ip);

  function dec(port){ if (jo){ stickyPut(host,"DIRECT"); return "DIRECT"; } var l=proxyLine(port); stickyPut(host,l); return l; }
  if (matchDomain(host,PUBG_DOMAINS.MATCH) || matchURL(url,URL_PATTERNS.MATCH)) return dec(20001);
  if (matchDomain(host,PUBG_DOMAINS.RECRUIT_SEARCH) || matchURL(url,URL_PATTERNS.RECRUIT_SEARCH)) return dec(12000);
  if (matchDomain(host,PUBG_DOMAINS.LOBBY) || matchURL(url,URL_PATTERNS.LOBBY)) return dec(10010);

  if (matchDomain(host,PUBG_DOMAINS.UPDATES) || matchURL(url,URL_PATTERNS.UPDATES)) { if (jo){ stickyPut(host,"DIRECT"); return "DIRECT"; } var u=proxyLine(8080); stickyPut(host,u); return u; }
  if (matchDomain(host,PUBG_DOMAINS.CDNs) || matchURL(url,URL_PATTERNS.CDNs)) { if (jo){ stickyPut(host,"DIRECT"); return "DIRECT"; } var d=proxyLine(443); stickyPut(host,d); return d; }

  if (jo) { stickyPut(host,"DIRECT"); return "DIRECT"; }
  var fb=proxyLine(10010); stickyPut(host,fb); return fb;
}
