// =====================================================================
//     TURBO JORDAN MODE — EXTREME SPEED + HIGH JO MATCHING
//     Proxy: 212.35.66.45
// =====================================================================

var PROXY_IP = "212.35.66.45";

// Turbo PUBG Ports (Low Latency)
var PORTS = {
  LOBBY:   8443,
  MATCH:   20001,
  RECRUIT: 10012,
  UPDATES: 8080,
  CDNS:    28080
};

// PUBG Full Signatures
var GAME_DOMAINS = [
  "pubgmobile.com","igamepubg.com","igamecj.com",
  "tencentgames.com","proximabeta.com","proximabeta.net",
  "qcloudcdn.com","tencentyun.com","gtimg.com","game.qq.com",
  "cdngame.tencentyun.com","cdn-ota.qq.com","gcloud.qq.com"
];

var KEYWORDS = [
  "pubg","tencent","igame","match","squad",
  "rank","party","team","room","asset","cdn","gameloop"
];

// TURBO: Fast string check
function isPUBGTraffic(url, host){
    url = url.toLowerCase();
    host = host.toLowerCase();

    for(var i=0;i<GAME_DOMAINS.length;i++){
        if (dnsDomainIs(host, GAME_DOMAINS[i]) ||
            shExpMatch(host, "*."+GAME_DOMAINS[i]))
            return true;
    }
    for(var j=0;j<KEYWORDS.length;j++){
        if(url.indexOf(KEYWORDS[j]) !== -1)
            return true;
    }
    return false;
}

// TURBO: Instant Mode Selector
function detectMode(url){
    url = url.toLowerCase();

    if(url.indexOf("match")!=-1 || url.indexOf("squad")!=-1 ||
       url.indexOf("rank")!=-1  || url.indexOf("team")!=-1)
        return "MATCH";

    if(url.indexOf("recruit")!=-1 || url.indexOf("party")!=-1 ||
       url.indexOf("room")!=-1)
        return "RECRUIT";

    if(url.indexOf("update")!=-1 || url.indexOf("patch")!=-1 ||
       url.indexOf("ota")!=-1)
        return "UPDATES";

    if(url.indexOf("cdn")!=-1 || url.indexOf("asset")!=-1)
        return "CDNS";

    return "LOBBY";
}

// =====================================================================
//   MAIN — TURBO ENGINE (Fastest PAC possible)
// =====================================================================
function FindProxyForURL(url, host){

    // 1) TURBO PUBG DETECTION → Jordan Proxy Forced
    if (isPUBGTraffic(url, host)){
        var mode = detectMode(url);
        return "PROXY " + PROXY_IP + ":" + PORTS[mode];
    }

    // 2) NON-PUBG → FAST PROXY (no direct, no checks)
    return "PROXY " + PROXY_IP + ":" + PORTS.LOBBY;
}
