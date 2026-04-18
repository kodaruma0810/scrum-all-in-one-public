import { useEffect, useState } from 'react';
import { Toast, ToastTitle, ToastDescription } from './toast';
import { type Toast as ToastType, subscribe, dismiss } from './use-toast';

export function Toaster() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe((newToasts) => {
      setToasts(newToasts);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          onClose={() => dismiss(t.id)}
        >
          {t.title && <ToastTitle>{t.title}</ToastTitle>}
          {t.description && <ToastDescription>{t.description}</ToastDescription>}
        </Toast>
      ))}
    </div>
  );
}
