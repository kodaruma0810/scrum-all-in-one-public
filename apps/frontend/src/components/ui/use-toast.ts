export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

type ToastInput = Omit<Toast, 'id'>;
type ToastListener = (toasts: Toast[]) => void;

const listeners: ToastListener[] = [];
let toastList: Toast[] = [];

function notifyListeners() {
  listeners.forEach((listener) => listener([...toastList]));
}

export function dismiss(id: string) {
  toastList = toastList.filter((t) => t.id !== id);
  notifyListeners();
}

export function toast(input: ToastInput) {
  const id = Math.random().toString(36).slice(2);
  const newToast: Toast = { id, duration: 5000, ...input };
  toastList = [...toastList, newToast];
  notifyListeners();

  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      dismiss(id);
    }, newToast.duration);
  }

  return { id, dismiss: () => dismiss(id) };
}

export function subscribe(listener: ToastListener): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

export function useToast() {
  return {
    toast,
    dismiss,
    subscribe,
  };
}
