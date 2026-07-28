  const APP_ID = 'nsit-app';
  const VERSION = '1.2.43';
  const NODEIMAGE_KEY = 'nsit-nodeimage-api-key';
  const RUNTIME_KEY = '__nodeSeekIssueTemplatesRuntime__';
  const STORAGE_KEY = 'nsit-single-server-draft-v1';
  const TG_CONTACT_KEY = 'nsit-tg-contact-v1';
  const CARD_TOGGLE_KEY = 'nsit-generate-value-card';
  const MACHINE_FIELDS = ['vendor', 'model', 'cpu', 'memory', 'disk', 'bandwidth', 'traffic', 'renewalCycle', 'renewalAmount', 'currency', 'expiryDate', 'tradeDate', 'nqUrl', 'tqUrl', 'askingPrice', 'askingPremium', 'remarks'];
  const RATE_CACHE_KEY = 'nsit-cny-rates-v1';
  const MACHINE_CATALOG_API_URL = 'https://nsit-machine-catalog.ruoqianfengshao.workers.dev';
  const MACHINE_CATALOG_FIELDS = ['vendor', 'model', 'cpu', 'memory', 'disk', 'bandwidth', 'traffic', 'renewalCycle', 'renewalAmount', 'currency'];
  const CURRENCY_CODES = { 'CNY 人民币': 'CNY', 'USD 美元': 'USD', 'EUR 欧元': 'EUR', 'GBP 英镑': 'GBP', 'JPY 日元': 'JPY', 'KRW 韩元': 'KRW', 'AUD 澳元': 'AUD', 'HKD 港元': 'HKD', 'TWD 新台币': 'TWD', 'CAD 加拿大元': 'CAD', 'SGD 新加坡元': 'SGD' };
  const CYCLE_MONTHS = { '月付': 1, '季付': 3, '半年付': 6, '年付': 12, '两年付': 24, '三年付': 36, '五年付': 60 };
  const OPTIONS = {
    vendors: ['搬瓦工', 'DMIT', 'RackNerd', 'Vultr', 'CloudCone', 'BuyVM', 'Hetzner', 'Linode', 'DigitalOcean', 'Lightlayer', '狗妈咪', '奶爸', 'Vmiss', '阿里云', '腾讯云', '火山云', '华为云'],
    cpu: ['0.5C', '1C', '2C', '3C', '4C', '5C', '6C', '7C', '8C'],
    memory: ['0.5G', '1G', '2G', '3G', '4G', '6G', '8G'],
    disk: ['1G', '2G', '4G', '5G', '10G', '20G', '50G', '100G'],
    bandwidth: ['10M', '20M', '30M', '40M', '50M', '100M', '200M', '500M', '1G'],
    traffic: ['150G', '200G', '300G', '400G', '500G', '1T', '2T', '4T'],
    renewalCycle: ['月付', '季付', '半年付', '年付', '两年付', '三年付', '五年付'],
  };
  const VENDOR_ICONS = {
    DMIT: __NSIT_VENDOR_ASSET__('dmit.ico'),
    RackNerd: __NSIT_VENDOR_ASSET__('racknerd.ico'),
    Vultr: __NSIT_VENDOR_ASSET__('vultr.ico'),
    CloudCone: __NSIT_VENDOR_ASSET__('cloudcone.ico'),
    BuyVM: __NSIT_VENDOR_ASSET__('buyvm.ico'),
    Hetzner: __NSIT_VENDOR_ASSET__('hetzner.ico'),
    Linode: __NSIT_VENDOR_ASSET__('linode.ico'),
    DigitalOcean: __NSIT_VENDOR_ASSET__('digitalocean.ico'),
    Lightlayer: __NSIT_VENDOR_ASSET__('lightlayer.ico'),
    '狗妈咪': __NSIT_VENDOR_ASSET__('gomami.png'),
    '奶爸': __NSIT_VENDOR_ASSET__('neburst.svg'),
    Vmiss: __NSIT_VENDOR_ASSET__('vmiss.png'),
    '阿里云': __NSIT_VENDOR_ASSET__('aliyun.ico'),
    '腾讯云': __NSIT_VENDOR_ASSET__('tencent.png'),
    '火山云': __NSIT_VENDOR_ASSET__('volcengine.png'),
    '华为云': __NSIT_VENDOR_ASSET__('huawei.png'),
  };

  const fields = [
    ['postTitle', '帖子标题', 'text', '会根据填写内容自动生成，也可手动修改'],
    ['vendor', '厂商', 'list', '输入或选择厂商', 'vendors'],
    ['model', '型号', 'text', '请输入并查询'],
    ['cpu', 'CPU', 'list', '输入或选择', 'cpu'],
    ['memory', '内存', 'list', '输入或选择', 'memory'],
    ['disk', '硬盘', 'list', '输入或选择', 'disk'],
    ['bandwidth', '带宽', 'list', '输入或选择', 'bandwidth'],
    ['traffic', '流量', 'list', '输入或选择', 'traffic'],
    ['renewalCycle', '续费周期', 'list', '输入或选择', 'renewalCycle'],
    ['renewalAmount', '续费金额', 'number', '0.00'],
    ['currency', '币种', 'select', '', ['CNY 人民币', 'USD 美元', 'EUR 欧元', 'GBP 英镑', 'JPY 日元', 'KRW 韩元', 'AUD 澳元', 'HKD 港元', 'TWD 新台币', 'CAD 加拿大元', 'SGD 新加坡元']],
    ['expiryDate', '到期日期', 'date'],
    ['tradeDate', '交易日期', 'date'],
    ['nqUrl', 'NQ 地址', 'url', 'https://...'],
    ['tqUrl', 'TQ 地址', 'url', 'https://...'],
    ['tgContact', 'TG 联系', 'text', '@username 或 https://t.me/...'],
    ['askingPrice', '预出总价（人民币）', 'number', '一口价'],
    ['askingPremium', '预出溢价（人民币）', 'number', '请输入溢价'],
    ['remarks', '单机备注', 'textarea', '补充说明'],
    ['postRemarks', '整贴备注', 'textarea', '适用于整帖的补充说明'],
  ];
  const OPTIONAL_FIELDS = new Set(['nqUrl', 'tqUrl', 'tgContact', 'remarks', 'postRemarks', 'askingPrice', 'askingPremium']);
