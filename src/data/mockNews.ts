import type { Article, Category, TechIndexItem } from '../types/news';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Semua Berita', icon: 'layers', description: 'Semua kabar & pembaruan teknologi terkini' },
  { id: 'ai', name: 'Kecerdasan Buatan', icon: 'cpu', description: 'Inovasi AI, LLM, Otomasi & Agentic Coding' },
  { id: 'gadget', name: 'Gadget & Inovasi', icon: 'smartphone', description: 'Review, rumor & rilis perangkat terbaru' },
  { id: 'cybersecurity', name: 'Keamanan Siber', icon: 'shield-alert', description: 'Perlindungan data, privasi & ancaman siber' },
  { id: 'startup', name: 'Startup & Bisnis', icon: 'trending-up', description: 'Ekosistem pendanaan, unicorn & inovasi bisnis' },
  { id: 'policy', name: 'Kebijakan Digital', icon: 'file-text', description: 'Regulasi pemerintah, PDP & infrastruktur nasional' },
  { id: 'telecom', name: 'Telekomunikasi', icon: 'radio', description: 'Jaringan 5G/6G, internet satelit & konektivitas' },
  { id: 'developer', name: 'Kolektif Developer', icon: 'code', description: 'Bahasa pemrograman, cloud & tren software engineering' }
];

export const TECH_INDEXES: TechIndexItem[] = [
  {
    symbol: 'IDXTECH', name: 'Indeks Tekno RI', value: '7,420.5', change: '+2.4%', isPositive: true,
    historicalData: [
      {time:'00:00',value:7245},{time:'01:00',value:7230},{time:'02:00',value:7218},{time:'03:00',value:7240},
      {time:'04:00',value:7260},{time:'05:00',value:7275},{time:'06:00',value:7310},{time:'07:00',value:7295},
      {time:'08:00',value:7330},{time:'09:00',value:7365},{time:'10:00',value:7340},{time:'11:00',value:7380},
      {time:'12:00',value:7350},{time:'13:00',value:7370},{time:'14:00',value:7395},{time:'15:00',value:7410},
      {time:'16:00',value:7385},{time:'17:00',value:7400},{time:'18:00',value:7390},{time:'19:00',value:7405},
      {time:'20:00',value:7415},{time:'21:00',value:7425},{time:'22:00',value:7418},{time:'23:00',value:7420}
    ]
  },
  {
    symbol: 'NVDA', name: 'NVIDIA Corp', value: '$138.25', change: '+3.8%', isPositive: true,
    historicalData: [
      {time:'00:00',value:133.2},{time:'01:00',value:133.0},{time:'02:00',value:132.8},{time:'03:00',value:133.1},
      {time:'04:00',value:133.5},{time:'05:00',value:133.9},{time:'06:00',value:134.4},{time:'07:00',value:134.1},
      {time:'08:00',value:134.8},{time:'09:00',value:135.6},{time:'10:00',value:135.2},{time:'11:00',value:136.0},
      {time:'12:00',value:135.7},{time:'13:00',value:136.3},{time:'14:00',value:136.8},{time:'15:00',value:137.2},
      {time:'16:00',value:136.9},{time:'17:00',value:137.5},{time:'18:00',value:137.1},{time:'19:00',value:137.6},
      {time:'20:00',value:137.9},{time:'21:00',value:138.1},{time:'22:00',value:138.0},{time:'23:00',value:138.25}
    ]
  },
  {
    symbol: 'BTC/IDR', name: 'Bitcoin', value: 'Rp 1.085B', change: '+1.9%', isPositive: true,
    historicalData: [
      {time:'00:00',value:1065},{time:'01:00',value:1060},{time:'02:00',value:1058},{time:'03:00',value:1062},
      {time:'04:00',value:1068},{time:'05:00',value:1070},{time:'06:00',value:1075},{time:'07:00',value:1072},
      {time:'08:00',value:1078},{time:'09:00',value:1080},{time:'10:00',value:1076},{time:'11:00',value:1082},
      {time:'12:00',value:1079},{time:'13:00',value:1081},{time:'14:00',value:1083},{time:'15:00',value:1085},
      {time:'16:00',value:1082},{time:'17:00',value:1084},{time:'18:00',value:1080},{time:'19:00',value:1083},
      {time:'20:00',value:1084},{time:'21:00',value:1086},{time:'22:00',value:1084},{time:'23:00',value:1085}
    ]
  },
  {
    symbol: 'AI-IDX', name: 'Global AI Index', value: '4,150.1', change: '+4.1%', isPositive: true,
    historicalData: [
      {time:'00:00',value:3985},{time:'01:00',value:3970},{time:'02:00',value:3960},{time:'03:00',value:3980},
      {time:'04:00',value:4005},{time:'05:00',value:4020},{time:'06:00',value:4050},{time:'07:00',value:4035},
      {time:'08:00',value:4070},{time:'09:00',value:4095},{time:'10:00',value:4080},{time:'11:00',value:4105},
      {time:'12:00',value:4090},{time:'13:00',value:4100},{time:'14:00',value:4115},{time:'15:00',value:4125},
      {time:'16:00',value:4110},{time:'17:00',value:4130},{time:'18:00',value:4120},{time:'19:00',value:4135},
      {time:'20:00',value:4140},{time:'21:00',value:4148},{time:'22:00',value:4145},{time:'23:00',value:4150}
    ]
  },
  {
    symbol: 'STARTUP-RI', name: 'Funding Vol', value: '$450M', change: '-0.5%', isPositive: false,
    historicalData: [
      {time:'00:00',value:455},{time:'01:00',value:456},{time:'02:00',value:457},{time:'03:00',value:455},
      {time:'04:00',value:454},{time:'05:00',value:453},{time:'06:00',value:452},{time:'07:00',value:454},
      {time:'08:00',value:453},{time:'09:00',value:451},{time:'10:00',value:452},{time:'11:00',value:450},
      {time:'12:00',value:451},{time:'13:00',value:449},{time:'14:00',value:450},{time:'15:00',value:451},
      {time:'16:00',value:450},{time:'17:00',value:449},{time:'18:00',value:450},{time:'19:00',value:451},
      {time:'20:00',value:450},{time:'21:00',value:449},{time:'22:00',value:450},{time:'23:00',value:450}
    ]
  },
  {
    symbol: 'NASDAQ', name: 'NASDAQ Composite', value: '16.730,20', change: '+1.8%', isPositive: true,
    historicalData: [
      {time:'00:00',value:16500},{time:'01:00',value:16520},{time:'02:00',value:16490},{time:'03:00',value:16530},
      {time:'04:00',value:16550},{time:'05:00',value:16580},{time:'06:00',value:16610},{time:'07:00',value:16590},
      {time:'08:00',value:16620},{time:'09:00',value:16650},{time:'10:00',value:16630},{time:'11:00',value:16670},
      {time:'12:00',value:16640},{time:'13:00',value:16660},{time:'14:00',value:16690},{time:'15:00',value:16710},
      {time:'16:00',value:16680},{time:'17:00',value:16700},{time:'18:00',value:16690},{time:'19:00',value:16705},
      {time:'20:00',value:16715},{time:'21:00',value:16725},{time:'22:00',value:16718},{time:'23:00',value:16730.2}
    ]
  },
  {
    symbol: 'GOTO', name: 'GoTo Gojek Tokopedia', value: 'Rp 53', change: '0.0%', isPositive: true,
    historicalData: [
      {time:'00:00',value:50},{time:'01:00',value:51},{time:'02:00',value:50},{time:'03:00',value:52},
      {time:'04:00',value:51},{time:'05:00',value:50},{time:'06:00',value:51},{time:'07:00',value:52},
      {time:'08:00',value:53},{time:'09:00',value:52},{time:'10:00',value:51},{time:'11:00',value:50},
      {time:'12:00',value:51},{time:'13:00',value:52},{time:'14:00',value:53},{time:'15:00',value:52},
      {time:'16:00',value:51},{time:'17:00',value:52},{time:'18:00',value:53},{time:'19:00',value:52},
      {time:'20:00',value:51},{time:'21:00',value:52},{time:'22:00',value:53},{time:'23:00',value:53}
    ]
  },
  {
    symbol: 'ETH/IDR', name: 'Ethereum', value: 'Rp 53.60M', change: '+1.2%', isPositive: true,
    historicalData: [
      {time:'00:00',value:52100000},{time:'01:00',value:52000000},{time:'02:00',value:51900000},{time:'03:00',value:52200000},
      {time:'04:00',value:52400000},{time:'05:00',value:52600000},{time:'06:00',value:52900000},{time:'07:00',value:52700000},
      {time:'08:00',value:53000000},{time:'09:00',value:53300000},{time:'10:00',value:53100000},{time:'11:00',value:53400000},
      {time:'12:00',value:53200000},{time:'13:00',value:53300000},{time:'14:00',value:53500000},{time:'15:00',value:53600000},
      {time:'16:00',value:53400000},{time:'17:00',value:53500000},{time:'18:00',value:53300000},{time:'19:00',value:53400000},
      {time:'20:00',value:53500000},{time:'21:00',value:53600000},{time:'22:00',value:53500000},{time:'23:00',value:53600000}
    ]
  },
  {
    symbol: 'USD/IDR', name: 'Kurs USD/IDR', value: 'Rp 16.254', change: '+0.2%', isPositive: true,
    historicalData: [
      {time:'00:00',value:16210},{time:'01:00',value:16215},{time:'02:00',value:16200},{time:'03:00',value:16220},
      {time:'04:00',value:16225},{time:'05:00',value:16230},{time:'06:00',value:16240},{time:'07:00',value:16235},
      {time:'08:00',value:16242},{time:'09:00',value:16248},{time:'10:00',value:16240},{time:'11:00',value:16250},
      {time:'12:00',value:16244},{time:'13:00',value:16246},{time:'14:00',value:16252},{time:'15:00',value:16254},
      {time:'16:00',value:16248},{time:'17:00',value:16250},{time:'18:00',value:16249},{time:'19:00',value:16251},
      {time:'20:00',value:16253},{time:'21:00',value:16255},{time:'22:00',value:16252},{time:'23:00',value:16254}
    ]
  }
];

export const ARTICLES: Article[] = [];


