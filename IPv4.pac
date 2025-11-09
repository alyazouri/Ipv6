function FindProxyForURL(url, host) {
  // STRICT_JO_ROUTERS (Geo) — live-built
  var JO_PROXY_HOST = "127.0.0.1";
  var PORT_LOBBY = 10010;
  var PORT_MATCH = 20001;
  var PORT_RECRUIT_SEARCH = 12000;
  var PORT_UPDATES = 8080;
  var PORT_CDN = 443;
  var STICKY_MINUTES = 10;

  var JO_V4_PREFIXES = [
    "37.17.200.2/32",
    "37.202.65.224/32",
    "37.202.78.9/32",
    "37.202.79.128/32",
    "37.202.84.30/32",
    "37.202.84.62/32",
    "37.202.87.150/32",
    "37.202.87.253/32",
    "37.202.94.16/32",
    "37.202.96.190/32",
    "37.202.100.128/32",
    "37.202.102.252/32",
    "37.202.111.30/32",
    "37.202.126.62/32",
    "37.220.120.16/32",
    "37.220.120.33/32",
    "37.220.120.150/32",
    "37.220.120.250/32",
    "37.220.120.251/32",
    "37.220.121.1/32",
    "37.220.121.2/32",
    "37.220.121.14/32",
    "37.220.121.195/32",
    "37.220.123.33/32",
    "37.220.123.224/32",
    "46.23.112.6/32",
    "46.23.112.65/32",
    "46.23.112.194/32",
    "46.23.112.224/32",
    "46.23.115.9/32",
    "46.23.122.194/32",
    "46.23.123.195/32",
    "46.32.96.190/32",
    "46.32.97.225/32",
    "46.32.97.250/32",
    "46.32.98.2/32",
    "46.32.98.10/32",
    "46.32.98.99/32",
    "46.32.98.226/32",
    "46.32.99.226/32",
    "46.32.100.9/32",
    "46.32.100.31/32",
    "46.32.100.63/32",
    "46.32.100.132/32",
    "46.32.100.190/32",
    "46.32.100.224/32",
    "46.32.100.225/32",
    "46.32.100.251/32",
    "46.32.101.15/32",
    "46.32.101.16/32",
    "46.32.101.62/32",
    "46.32.102.1/32",
    "46.32.102.4/32",
    "46.32.102.10/32",
    "46.32.102.128/32",
    "46.32.102.150/32",
    "46.32.102.195/32",
    "46.32.102.225/32",
    "46.32.104.66/32",
    "46.32.104.99/32",
    "46.32.104.100/32",
    "46.32.104.101/32",
    "46.32.104.130/32",
    "46.32.104.132/32",
    "46.32.104.150/32",
    "46.32.104.194/32",
    "46.32.109.1/32",
    "46.32.109.31/32",
    "46.32.112.225/32",
    "46.32.112.226/32",
    "46.32.113.14/32",
    "46.32.113.64/32",
    "46.32.113.127/32",
    "46.32.113.129/32",
    "46.32.113.194/32",
    "46.32.114.5/32",
    "46.32.114.10/32",
    "46.32.114.33/32",
    "46.32.114.62/32",
    "46.32.114.194/32",
    "46.32.114.253/32",
    "46.32.115.33/32",
    "46.32.115.101/32",
    "46.32.115.190/32",
    "46.32.115.194/32",
    "46.32.115.224/32",
    "46.32.115.225/32",
    "46.32.115.253/32",
    "46.32.119.10/32",
    "46.32.120.14/32",
    "46.32.120.15/32",
    "46.32.120.16/32",
    "46.32.120.62/32",
    "46.185.128.14/32",
    "46.185.128.16/32",
    "46.185.128.63/32",
    "46.185.128.130/32",
    "46.185.128.192/32",
    "46.185.128.250/32",
    "46.185.129.9/32",
    "46.185.129.66/32",
    "46.185.129.130/32",
    "46.185.129.190/32",
    "46.185.130.150/32",
    "46.185.131.9/32",
    "46.185.131.10/32",
    "46.185.131.33/32",
    "46.185.131.101/32",
    "46.185.131.190/32",
    "46.185.131.195/32",
    "46.185.131.251/32",
    "46.185.135.10/32",
    "46.185.135.99/32",
    "46.185.138.4/32",
    "46.185.138.9/32",
    "46.185.138.14/32",
    "46.185.138.99/32",
    "46.185.138.100/32",
    "46.185.139.127/32",
    "46.185.139.129/32",
    "46.185.139.130/32",
    "46.185.139.160/32",
    "46.185.139.253/32",
    "46.185.143.15/32",
    "46.185.143.100/32",
    "46.185.143.126/32",
    "46.185.143.195/32",
    "46.185.143.252/32",
    "46.185.145.195/32",
    "46.185.161.5/32",
    "46.185.161.6/32",
    "46.185.161.10/32",
    "46.185.161.15/32",
    "46.185.161.99/32",
    "46.185.161.129/32",
    "46.185.161.190/32",
    "46.185.161.251/32",
    "46.185.162.2/32",
    "46.185.162.10/32",
    "46.185.162.127/32",
    "46.185.162.150/32",
    "46.185.162.193/32",
    "46.185.163.128/32",
    "46.185.163.194/32",
    "46.185.163.252/32"
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
    UPDATES:["*/patch*","*/update*","*/hotfix*","*/download*","*/assets/*","*/assetbundle*","*/obb*"],
    CDNs:["*/cdn/*","*/image/*","*/media/*","*/video/*","*/res/*","*/pkg/*"]
  };

  function ip4ToInt(ip){var p=ip.split('.');return((p[0]<<24)>>>0)+(p[1]<<16)+(p[2]<<8)+(p[3]>>>0);}
  function inCidrV4(ip,c){var a=c.split('/'),b=a[0],t=a.length>1?parseInt(a[1],10):32;var i=ip4ToInt(ip),bi=ip4ToInt(b);var m=t===0?0:(~((1<<(32-t))-1))>>>0;return (i&m)===(bi&m);}
  function isJO(ip){if(!ip||ip.indexOf('.')<0)return false;for(var i=0;i<JO_V4_PREFIXES.length;i++) if(inCidrV4(ip,JO_V4_PREFIXES[i]))return true;return false;}

  if(typeof _stickyCache==="undefined"){var _stickyCache={};}function nowMin(){return Math.floor((new Date()).getTime()/60000);}
  function stickyGet(h){var e=_stickyCache[h];if(!e)return null;if(nowMin()-e.t>STICKY_MINUTES)return null;return e.v;}
  function stickyPut(h,v){_stickyCache[h]={t:nowMin(),v:v};}

  var YT=["youtube.com","youtu.be","googlevideo.com","ytimg.com","youtube-nocookie.com"]; if (matchDomain(host,YT)) return "DIRECT";

  var c=stickyGet(host); if (c) return c;
  var ip=dnsResolve(host), jo=isJO(ip);

  function dec(port){ if (jo){ stickyPut(host,"DIRECT"); return "DIRECT"; } var l=proxyLine(port); stickyPut(host,l); return l; }
  if (matchDomain(host,PUBG_DOMAINS.MATCH) || matchURL(url,URL_PATTERNS.MATCH)) return dec(20001);
  if (matchDomain(host,PUBG_DOMAINS.RECRUIT_SEARCH) || matchURL(url,URL_PATTERNS.RECRUIT_SEARCH)) return dec(12000);
  if (matchDomain(host,PUBG_DOMAINS.LOBBY) || matchURL(url,URL_PATTERNS.LOBBY)) return dec(10010);

  if (matchDomain(host,PUBG_DOMAINS.UPDATES) || matchURL(url,URL_PATTERNS.UPDATES)) { if (jo){ stickyPut(host,"DIRECT"); return "DIRECT"; } var u=proxyLine(8080); stickyPut(host,u); return u; }
  if (matchDomain(host,PUBG_DOMAINS.CDNs) || matchURL(url,URL_PATTERNS.CDNs)) { if (jo){ stickyPut(host,"DIRECT"); return "DIRECT"; } var d=proxyLine(443); stickyPut(host,d); return d; }

  if (jo) { stickyPut(host,"DIRECT"); return "DIRECT"; }
  var fb=proxyLine(10010); stickyPut(host,fb); return fb;
}
