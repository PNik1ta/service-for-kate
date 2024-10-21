// lib/ton-connect.js

import { TonConnect } from '@tonconnect/sdk';
import { FRONT_URL } from '../constants/front-url';

// Создаем экземпляр SDK
export const tonConnect = new TonConnect({
  manifestUrl: `${FRONT_URL}/tonconnect-manifest.json`,
});
