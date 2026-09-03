import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { FIREBASE_APP } from './storage.tokens';

export const firebaseAdminProvider: Provider = {
  provide: FIREBASE_APP,
  useFactory: (configService: ConfigService): App => {
    const existingApp = getApps()[0];
    if (existingApp) return existingApp;

    return initializeApp({
      credential: cert({
        projectId: configService.get<string>('firebase.projectId'),
        clientEmail: configService.get<string>('firebase.clientEmail'),
        privateKey: configService
          .get<string>('firebase.privateKey')
          ?.replace(/\\n/g, '\n'),
      }),
      storageBucket: configService.get<string>('firebase.storageBucket'),
    });
  },
  inject: [ConfigService],
};
