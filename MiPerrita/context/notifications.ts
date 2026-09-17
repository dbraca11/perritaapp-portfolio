import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registrarToken(username: string) {
  try {
    if (!Device.isDevice) {
      console.log('⚠️ Las notificaciones push no funcionan en emuladores');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('⚠️ Permiso de notificaciones denegado');
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    console.log('📱 Obteniendo token con projectId:', projectId);

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    console.log('🔑 Token obtenido:', token);

    await setDoc(doc(db, 'tokens', username), {
      username,
      token,
      actualizado: new Date().toISOString(),
    });

    console.log('✅ Token guardado en Firestore para:', username);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E91E63',
      });
    }

    return token;
  } catch (error) {
    console.error('❌ Error en registrarToken:', error);
    return null;
  }
}

export async function enviarNotificacionAOtros(
  usernameActual: string,
  titulo: string,
  cuerpo: string
) {
  try {
    const snapshot = await getDocs(collection(db, 'tokens'));
    const tokens: string[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.username !== usernameActual && data.token) {
        tokens.push(data.token);
      }
    });

    console.log('📤 Tokens encontrados para notificar:', tokens.length);

    if (tokens.length === 0) {
      console.log('⚠️ No hay otros usuarios registrados');
      return;
    }

    const mensajes = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title: titulo,
      body: cuerpo,
      data: { tipo: 'comida' },
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mensajes),
    });

    const result = await response.json();
    console.log('✅ Respuesta de Expo:', JSON.stringify(result));
  } catch (error) {
    console.error('❌ Error al enviar notificación:', error);
  }
}