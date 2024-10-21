// lib/ton-connect.js

import { TonConnect } from '@tonconnect/sdk';

// Создаем экземпляр SDK
export const tonConnect = new TonConnect({
  manifestUrl: 'https://4797-168-119-119-151.ngrok-free.app/tonconnect-manifest.json',
});
