import { theme as antdTheme } from 'antd';

// proxinet.in ke brand blue (#d62b1f) par based Ant Design token set.
const shared = {
  colorPrimary: '#d62b1f',
  colorInfo: '#d62b1f',
  colorSuccess: '#12a06a',
  colorWarning: '#d18700',
  colorError: '#d2453c',
  colorLink: '#d62b1f',
  borderRadius: 10,
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  fontSize: 15,
  controlHeight: 42,
  wireframe: false,
};

export const lightTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    ...shared,
    colorBgBase: '#ffffff',
    colorTextBase: '#101d2b',
    colorBorder: '#e2e9f0',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    boxShadowSecondary: '0 8px 30px -12px rgba(10,21,32,.18)',
  },
  components: {
    Button: { fontWeight: 600, primaryShadow: '0 8px 24px -10px rgba(0,116,199,.6)' },
    Card: { paddingLG: 24 },
    Input: { paddingBlock: 9 },
    Menu: { itemBg: 'transparent', horizontalItemSelectedColor: '#d62b1f' },
    Steps: { colorPrimary: '#d62b1f' },
    Tabs: { inkBarColor: '#d62b1f', itemSelectedColor: '#d62b1f' },
  },
};

export const darkTheme = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    ...shared,
    colorPrimary: '#e56458',
    colorLink: '#f09b94',
    colorBgBase: '#0a1520',
    colorTextBase: '#e8eff5',
    colorBorder: '#1e3145',
    colorBgContainer: '#101d2b',
    colorBgElevated: '#152437',
    boxShadowSecondary: '0 8px 30px -12px rgba(0,0,0,.6)',
  },
  components: {
    Button: { fontWeight: 600, primaryShadow: '0 8px 24px -10px rgba(53,151,221,.5)' },
    Card: { paddingLG: 24 },
    Input: { paddingBlock: 9 },
    Menu: { itemBg: 'transparent', horizontalItemSelectedColor: '#f09b94' },
    Steps: { colorPrimary: '#e56458' },
    Tabs: { inkBarColor: '#e56458', itemSelectedColor: '#f09b94' },
  },
};
