/***************************************************************
 *   JO-ULTRA-DIVERSITY PRO — PUBG MOBILE (MAX EFFICIENCY)    *
 *   أسرع + أخف + أقوى كود PAC في التاريخ (Zain + GO فقط)     *
 *   كل النطاقات السكنية الأردنية (Zain/Umniah/Orange)      *
 *   تنفيذ فوري، لا تأخير، لا تكرار، لا هدر ذاكرة           *
 *   جاهز لـ SwitchyOmega / Clash / Surge / Quantumult X       *
 ***************************************************************/

function FindProxyForURL(url, host) {

  // ================== إعدادات ثابتة (أسرع من var) ==================
  const MODE           = "HUNT_LITE";
  const EPOCH_MIN      = MODE==="COZY"?60 : MODE==="HUNT"?30 : 45;
  const RECRUIT_SALT   = 7331;
  const STICKY_MIN     = Math.min(8, EPOCH_MIN);
  const NOW            = Date.now()/6e4|0;
  const EPOCH          = NOW/EPOCH_MIN|0;

  // ================== مخارج الأنفاق (Zain + GO فقط) ==================
  const EGRESS = [
    {h:"212.35.66.45", p:{g:20001,c:443,u:8080}, v4:"212.35.64.0/19",      v6:"2a00:18d0::/29", w:1},
    {h:"176.29.21.98",  p:{g:443,   c:443,u:8080}, v4:"176.29.0.0/16",       v6:"2a03:b640::/32", w:9}
  ];

  // ================== كل النطاقات السكنية الأردنية (DIRECT فوري) ==================
  const RES_V4 = [
    "176.29.0.0/16","80.90.160.0/20","46.32.96.0/19","77.245.0.0/20","185.67.200.0/22","185.210.92.0/22","185.40.152.0/22","185.59.96.0/22",
    "95.172.192.0/19","109.107.224.0/19","92.241.32.0/20","37.220.112.0/20","91.186.224.0/20","46.248.192.0/19","185.108.104.0/22","185.140.68.0/22","185.157.88.0/22","185.170.68.0/22","185.70.196.0/22",
    "212.34.128.0/19","212.34.160.0/19","212.34.192.0/18","213.139.32.0/19","89.237.0.0/18","185.24.36.0/22","185.40.156.0/22","185.71.112.0/22","185.86.76.0/22","185.97.100.0/22","185.120.220.0/22"
  ];
  const RES_V6 = ["2a03:b640::/32","2a03:6b00::/29","2a00:18d8::/29"];

  // ================== دومينات PUBG + CDN + YT ==================
  const PUBG_LOBBY  = "*.pubgmobile.com|*.pubgmobile.net|*.proximabeta.com|*.igamecj.com";
  const PUBG_MATCH  = "*.gcloud.qq.com|gpubgm.com";
  const PUBG_RECR   = "match.igamecj.com|match.proximabeta.com|teamfinder.igamecj.com|teamfinder.proximabeta.com|clan.igamecj.com";
  const CDN_DOM     = "cdn.pubgmobile.com|updates.pubgmobile.com|patch.igamecj.com|hotfix.proximabeta.com|dlied?.qq.com|cdn.igamecj.com|cdn.proximabeta.com|cdn.tencentgames.com";
  const YT_DOM      = "youtube.com|youtu.be|googlevideo.com|ytimg.com";

  // ================== Sticky Cache (أسرع من object) ==================
  const CACHE = typeof _c==="object"?_c:(_c={});

  // ================== أدوات فائقة السرعة ==================
  const sh = shExpMatch;
  const dns = dnsDomainIs;
  const base = h => h.split(".").slice(-2).join(".");
  const key = () => base(host)+"|"+EPOCH;
  const getCache = () => { const e=CACHE[k=key()]; return e&&NOW-e.t<=STICKY_MIN ? e.v : null; };
  const setCache = v => CACHE[k=key()] = {t:NOW,v:v};

  const ip2int = ip => { const p=ip.split("."); return (p[0]<<24|p[1]<<16|p[2]<<8|p[3])>>>0; };
  const inV4 = (ip,cidr) => { const [net,mask]=cidr.split("/"); return (ip2int(ip)&(0xFFFFFFFF<< (32-mask))) === ip2int(net); };
  const inV6 = (ip,cidr) => {
    const [net,bits]=cidr.split("/"); const b=+bits;
    const h=ip.replace("::",":"+"0".repeat(8-ip.split(":").length+1).split("").join(":")).split(":").map(x=>("0000"+x).slice(-4)).join("");
    const n=net.split(":").map(x=>("0000"+x).slice(-4)).join("");
    return h.substr(0,b>>4)===n.substr(0,b>>4) && (!(b&3) || (parseInt(h.charAt(b>>4),16)&(0xF<<(4-(b&3)))) === (parseInt(n.charAt(b>>4),16)&(0xF<<(4-(b&3)))));
  };
  const isResJO = ip => ip && (ip.includes(":") ? RES_V6.some(c=>inV6(ip,c)) : RES_V4.some(c=>inV4(ip,c)));

  const hash = (s,salt=0) => { let h=0; for(let i=0;i<s.length;) h=(h*131+s.charCodeAt(i++)+salt)>>>0; return h; };
  const pick = (pool,seed) => {
    const total=pool.reduce((a,x)=>a+x.w,0);
    let r=(seed>>>0)%total, acc=0;
    for(let i=0;i<pool.length;i++) if((acc+=pool[i].w)>r) return i;
    return 0;
  };

  // ================== YouTube مباشرة ==================
  if (sh(host,YT_DOM)) return "DIRECT";

  // ================== جلب IP + Cache ==================
  const ip = dnsResolve(host);
  const cached = getCache();
  if (cached) return cached;

  // ================== 1. أردني سكني؟ → DIRECT فوري ==================
  if (isResJO(ip)) return setCache("DIRECT"),"DIRECT";

  // ================== 2. اختيار المخرج بذكاء ==================
  let isp = 0;
  for(let i=0;i<EGRESS.length;i++){
    const e=EGRESS[i];
    if ((e.v4&&inV4(ip,e.v4)) || (e.v6&&inV6(ip,e.v6))) { isp=i; break; }
  }

  if (isp===0) {
    const isRecruit = sh(host,PUBG_RECR) || sh(url,"*/teamfinder/*") || sh(url,"*/clan/*") || sh(url,"*/recruit/*");
    const seed = hash(base(host)+EPOCH, isRecruit?RECRUIT_SALT:0);
    isp = pick(EGRESS, seed);
  }

  const PROXY = EGRESS[isp];
  const line = (sh(host,PUBG_MATCH)||sh(host,PUBG_LOBBY)||sh(host,PUBG_RECR)||
                sh(url,"*/matchmaking/*")||sh(url,"*/mms/*")||sh(url,"*/game/*")) ?
               "SOCKS5 "+PROXY.h+":"+PROXY.p.g :
               sh(host,CDN_DOM)||sh(url,"*/cdn/*")||sh(url,"*/patch/*")||sh(url,"*/update/*") ?
               "SOCKS5 "+PROXY.h+":"+PROXY.p.c :
               "SOCKS5 "+PROXY.h+":"+PROXY.p.g;

  setCache(line);
  return line;
}
