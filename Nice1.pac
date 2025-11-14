// =====================================================================
//   ULTRA FULL-CONTROL JORDAN MODE — FINAL WITH IPv4 + IPv6 LOCK
//   Proxy: 212.35.66.45
//   Goal: FORCE PUBG into Jordan region, block any foreign route
// =====================================================================

var PROXY_IP = "212.35.66.45";
var BLOCK     = "PROXY 0.0.0.0:0";

// =====================================================================
//   SMART PUBG PORTS
// =====================================================================
var PORTS = {
    LOBBY:    8443,
    MATCH:    20001,
    RECRUIT:  10012,
    UPDATES:  8080,
    CDNS:     28080
};

// =====================================================================
//   PUBG DOMAIN SIGNATURES
// =====================================================================
var GAME_DOMAINS = [
  "pubgmobile.com","igamepubg.com","igamecj.com",
  "tencentgames.com","proximabeta.com","proximabeta.net",
  "qcloudcdn.com","tencentyun.com","gtimg.com","game.qq.com",
  "cdngame.tencentyun.com","cdn-ota.qq.com","gcloud.qq.com"
];

var KEYWORDS = [
  "pubg","tencent","match","squad","rank","team","party","room",
  "gcloud","igame","cdn","asset","gameloop"
];

// =====================================================================
//   IPv4 Jordan Ranges
// =====================================================================
var JO_V4 = [
    ["5.45.128.0",     "5.45.143.255"],
    ["37.17.192.0",    "37.17.207.255"],
    ["37.123.64.0",    "37.123.95.255"],
    ["37.202.64.0",    "37.202.127.255"],
    ["37.220.112.0",   "37.220.127.255"],
    ["46.23.112.0",    "46.23.127.255"],
    ["46.32.96.0",     "46.32.127.255"],
    ["46.185.128.0",   "46.185.255.255"],
    ["78.90.0.0",      "78.90.255.255"],
    ["94.249.0.0",     "94.249.255.255"],
    ["188.123.160.0",  "188.123.191.255"]
];

function ip4_to_long(ip){
    var p=ip.split(".");
    return ((p[0]<<24)|(p[1]<<16)|(p[2]<<8)|(p[3]<<0))>>>0;
}

function isJOIPv4(ip){
    if(!ip) return false;
    var L = ip4_to_long(ip);
    for(var i=0;i<JO_V4.length;i++){
        var a=ip4_to_long(JO_V4[i][0]);
        var b=ip4_to_long(JO_V4[i][1]);
        if(L>=a && L<=b) return true;
    }
    return false;
}

// =====================================================================
//   IPv6 Jordan Ranges
// =====================================================================
var JO_V6 = [
  {start:"2001:32c0:2000::", end:"2001:32c0:2fff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2001:32c0:6000::", end:"2001:32c0:6fff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2001:32c0:c000::", end:"2001:32c0:ffff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2001:32c1::",      end:"2001:32c1:ffff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2001:32c2::",      end:"2001:32c3:ffff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2001:32c4::",      end:"2001:32c4:ffff:ffff:ffff:ffff:ffff:ffff"},

  {start:"2a00:18d0:4000::", end:"2a00:18d0:5fff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2a00:18d0:6000::", end:"2a00:18d0:6fff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2a00:18d0:c000::", end:"2a00:18d0:ffff:ffff:ffff:ffff:ffff:ffff"},

  {start:"2a00:18d8:1000::", end:"2a00:18d8:1fff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2a00:18d8:4000::", end:"2a00:18d8:5fff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2a00:18d8:c000::", end:"2a00:18d8:ffff:ffff:ffff:ffff:ffff:ffff"},

  {start:"2a00:18d9::",      end:"2a00:18d9:ffff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2a00:18da::",      end:"2a00:18db:ffff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2a00:18dc::",      end:"2a00:18df:ffff:ffff:ffff:ffff:ffff:ffff"},

  {start:"2a03:6b00::",      end:"2a03:6b00:3fff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2a03:6b00:b000::", end:"2a03:6b00:bfff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2a03:6b00:c000::", end:"2a03:6b00:ffff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2a03:6b01::",      end:"2a03:6b01:ffff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2a03:6b02::",      end:"2a03:6b03:ffff:ffff:ffff:ffff:ffff:ffff"},
  {start:"2a03:6b04::",      end:"2a03:6b07:ffff:ffff:ffff:ffff:ffff:ffff"},

  {start:"2a03:b640::",      end:"2a03:b640:ffff:ffff:ffff:ffff:ffff:ffff"}
];

function expandIPv6(a){
    var parts=a.split("::");
    var head=parts[0].split(":");
    var tail=(parts.length>1)?parts[1].split(":"):[];
    function p(x){var o=[];for(var i=0;i<x.length;i++)if(x[i])o.push(parseInt(x[i],16));return o;}
    head=p(head); tail=p(tail);
    var miss=8-(head.length+tail.length), out=head.slice();
    while(miss-->0) out.push(0);
    return out.concat(tail);
}

function cmp6(a,b){
    for(var i=0;i<8;i++){
        if(a[i] < b[i]) return -1;
        if(a[i] > b[i]) return 1;
    }
    return 0;
}

function isJOIPv6(ip){
    if(!ip) return false;
    var X=expandIPv6(ip);
    for(var i=0;i<JO_V6.length;i++){
        var s=expandIPv6(JO_V6[i].start);
        var e=expandIPv6(JO_V6[i].end);
        if(cmp6(X,s)>=0 && cmp6(X,e)<=0) return true;
    }
    return false;
}

function extractV6(host){
    if(host.charAt(0)==="["){
        return host.substring(1,host.indexOf("]"));
    }
    if(host.indexOf(":")>=0 && host.indexOf(".")<0)
        return host;
    return null;
}

// =====================================================================
//   PUBG DETECTION
// =====================================================================
function isGameHost(host){
    var h = host.toLowerCase();
    for(var i=0;i<GAME_DOMAINS.length;i++){
        if(dnsDomainIs(h,GAME_DOMAINS[i]) || shExpMatch(h,"*."+GAME_DOMAINS[i]))
            return true;
    }
    return false;
}

function hasKeywords(url){
    var u=url.toLowerCase();
    for(var i=0;i<KEYWORDS.length;i++){
        if(u.indexOf(KEYWORDS[i])!=-1)
            return true;
    }
    return false;
}

function detectMode(url){
    url=url.toLowerCase();
    if(url.indexOf("match")!=-1||url.indexOf("squad")!=-1||url.indexOf("rank")!=-1||url.indexOf("team")!=-1)
        return "MATCH";
    if(url.indexOf("recruit")!=-1||url.indexOf("party")!=-1||url.indexOf("room")!=-1)
        return "RECRUIT";
    if(url.indexOf("update")!=-1||url.indexOf("patch")!=-1||url.indexOf("ota")!=-1)
        return "UPDATES";
    if(url.indexOf("cdn")!=-1||url.indexOf("asset")!=-1)
        return "CDNS";
    return "LOBBY";
}

// =====================================================================
//   MAIN ENGINE — ULTRA FULL CONTROL (IPv4 + IPv6)
// =====================================================================
function FindProxyForURL(url, host) {

    var v6 = extractV6(host);
    var ip4 = dnsResolve(host);

    // -------------------------------
    // 1) IPv6 NOT Jordan? → BLOCK
    // -------------------------------
    if(v6 && !isJOIPv6(v6))
        return BLOCK;

    // -------------------------------
    // 2) IPv4 NOT Jordan? → BLOCK
    // -------------------------------
    if(ip4 && !isJOIPv4(ip4))
        return BLOCK;

    // -------------------------------
    // 3) PUBG TRAFFIC → Forced Jordan Ports
    // -------------------------------
    var isPUBG = isGameHost(host) || hasKeywords(url);
    if(isPUBG){
        var mode = detectMode(url);
        return "PROXY " + PROXY_IP + ":" + PORTS[mode];
    }

    // -------------------------------
    // 4) EVERYTHING ELSE → Jordan Proxy (no direct)
    // -------------------------------
    return "PROXY " + PROXY_IP + ":" + PORTS.LOBBY;
}
