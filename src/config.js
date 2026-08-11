  const APP_ID = 'nsit-app';
  const VERSION = '1.3.1';
  const NODEIMAGE_KEY = 'nsit-nodeimage-api-key';
  const RUNTIME_KEY = '__nodeSeekIssueTemplatesRuntime__';
  const STORAGE_KEY = 'nsit-single-server-draft-v1';
  const BUY_STORAGE_KEY = 'nsit-buy-draft-v1';
  const BUY_PERSONALIZATION_KEY = 'nsit-buy-personalization-v1';
  const TG_CONTACT_KEY = 'nsit-tg-contact-v1';
  const CARD_TOGGLE_KEY = 'nsit-generate-value-card';
  const PERSONALIZATION_KEY = 'nsit-personalization-v1';
  const VALUE_CARD_STYLES = [
    ['stardew-spring', '星露谷 · 春'],
    ['stardew-summer', '星露谷 · 夏'],
    ['stardew-autumn', '星露谷 · 秋'],
    ['stardew-winter', '星露谷 · 冬'],
    ['tank', '坦克大战'],
    ['custom', '自定义背景'],
  ];
  const VALUE_CARD_BACKGROUNDS = {
    'stardew-spring': 'https://cdn.nodeimage.com/i/SQSTxp0RlRIUdo3lBXxSMtkqGEwyZRNu.png',
    'stardew-summer': 'https://cdn.nodeimage.com/i/WG5DqOymMnoLadNkK0RZZI8Y14YZWQIC.png',
    'stardew-autumn': 'https://cdn.nodeimage.com/i/jisdumIB5PqfVFFMZ4fSlhupk4DUANRz.png',
    'stardew-winter': 'https://cdn.nodeimage.com/i/Zlw3BGEfrkEqmRD5kkHOkykh3LK19vFN.png',
    tank: 'https://cdn.nodeimage.com/i/kyNRM2d3M5RTtRBBXQxP4iMrITKqmV1T.png',
  };
  const RENEWAL_FIELD_OPTIONS = [
    ['renewal', '续费金额 / 周期'], ['expiryDate', '到期日期'], ['tradeDate', '交易日期'], ['remainingValue', '剩余价值'],
  ];
  const DEFAULT_RENEWAL_FIELDS = RENEWAL_FIELD_OPTIONS.map(([name]) => name);
  const MACHINE_FIELDS = ['vendor', 'model', 'cpu', 'memory', 'disk', 'bandwidth', 'traffic', 'remainingTraffic', 'renewalCycle', 'renewalAmount', 'currency', 'expiryDate', 'tradeDate', 'nqUrl', 'tqUrl', 'askingPrice', 'askingPremium', 'remarks'];
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
    traffic: ['150G', '200G', '300G', '400G', '500G', '1T', '2T', '4T', '不限流量'],
    renewalCycle: ['月付', '季付', '半年付', '年付', '两年付', '三年付', '五年付'],
  };
  const VENDOR_ICONS = {
    DMIT: 'https://www.dmit.io/favicon.ico',
    RackNerd: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/racknerd.png',
    Vultr: 'https://cdn.simpleicons.org/vultr',
    CloudCone: 'https://cloudcone.com/wp-content/uploads/2017/06/cropped-logo-2-32x32.png',
    BuyVM: 'https://buyvm.net/favicon.ico',
    Hetzner: 'https://cdn.simpleicons.org/hetzner',
    Linode: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/linode.png',
    DigitalOcean: 'https://cdn.simpleicons.org/digitalocean',
    Lightlayer: 'https://www.lightlayer.net/favicon.ico',
    '狗妈咪': 'https://gomami.io/templates/webflow/images/favicon.png',
    '奶爸': 'https://neburst.com/favicon.svg',
    Vmiss: 'https://cdn.nodeimage.com/i/eT6R4CDGq0OyDcCtbTZ9MNZEYkXHNLr7.png',
    '阿里云': 'https://cdn.simpleicons.org/alibabacloud',
    '腾讯云': 'https://cloudcache.tencent-cloud.com/qcloud/favicon.ico?t=201902181234',
    '火山云': 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/volcengine.png',
    '华为云': 'https://cdn.simpleicons.org/huawei',
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
  const PRESET_TRANSFER_TAGS = ['原邮出', '改邮出', '实名', '包中介', '不包中介', '包 push', '不包 push', '先机后款', '先款后机', '支付宝口令红包', '无 PP 争议'];
  const TRANSFER_TAG_GROUPS = { '原邮出': 'transfer', '改邮出': 'transfer', '包中介': 'broker', '不包中介': 'broker', '包 push': 'push', '不包 push': 'push', '先机后款': 'payment', '先款后机': 'payment' };
  const TITLE_FIELD_OPTIONS = [
    ...fields.filter(([name]) => name !== 'postTitle').map(([name, label]) => [name, label]),
    ['transferTags', '转让标签'],
  ];
  const DEFAULT_TITLE_FIELDS = ['askingPrice', 'vendor', 'model', 'cpu', 'memory', 'disk', 'bandwidth', 'traffic'];
  const OPTIONAL_FIELDS = new Set(['nqUrl', 'tqUrl', 'tgContact', 'remarks', 'postRemarks', 'askingPrice', 'askingPremium']);
  const BUY_PRICE_MODES = [
    ['remainingValue', '剩余价值收'], ['discount', '剩余价值折收'], ['premium', '剩余价值加价收'], ['total', '总价收'], ['remainingValueMinus', '剩余价值减额收'], ['offer', '带价聊'],
  ];
  const BUY_PRESET_TAGS = ['原邮', '改邮', '包中介', '不包中介', '先机后款', '先款后机', '站内私信'];
  const BUY_TAG_GROUPS = { 原邮: 'transfer', 改邮: 'transfer', 包中介: 'broker', 不包中介: 'broker', 先机后款: 'payment', 先款后机: 'payment', 站内私信: 'contact' };
  const BUY_TITLE_FIELD_OPTIONS = [['price', '收购方式'], ['vendor', '厂商'], ['model', '型号'], ['cpu', 'CPU'], ['memory', '内存'], ['disk', '硬盘'], ['bandwidth', '带宽'], ['traffic', '流量'], ['renewal', '续费金额 / 周期'], ['tags', '交易标签']];
  const DEFAULT_BUY_TITLE_FIELDS = ['price', 'vendor', 'model', 'cpu', 'memory', 'disk', 'bandwidth', 'traffic'];
