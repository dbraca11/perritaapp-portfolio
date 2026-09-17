import AsyncStorage from '@react-native-async-storage/async-storage';

let listener: (() => void) | null = null;

export const notificarBienvenidaVista = () => {
  if (listener) listener();
};

export const suscribirBienvenida = (cb: () => void) => {
  listener = cb;
  return () => {
    listener = null;
  };
};

export const marcarBienvenidaVista = async () => {
  await AsyncStorage.setItem('bienvenida_vista', 'true');
  notificarBienvenidaVista();
};