import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.devaloka.app',
  appName: 'Devaloka',
  webDir: 'build',
  server: {
    androidScheme: 'http'
  }
};

export default config;
