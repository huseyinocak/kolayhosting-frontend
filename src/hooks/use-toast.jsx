// src/hooks/use-toast.jsx

import * as React from "react";
import { ToastContext } from "./toast-utils"; // ToastContext'i yeni konumundan içe aktarıyoruz

// Toast sabitleri bu dosya içinde tanımlanacak
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000; // Toast'ın kaybolma süresi (ms)
const DURATION = 3000; // DURATION sabiti

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Reducer fonksiyonu
const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };
    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

// useToast hook'u (sadece bu dosya içinde kullanılacak)
function useToast() {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] });
  const toastTimeouts = React.useRef(new Map());

  const addToast = React.useCallback((props) => {
    const id = genId();
    const toast = { ...props, id, open: true };
    dispatch({ type: actionTypes.ADD_TOAST, toast });

    if (toast.duration !== Infinity && toast.duration !== 0) {
      const duration = toast.duration || DURATION;
      const timeout = setTimeout(() => {
        dispatch({ type: actionTypes.DISMISS_TOAST, toastId: toast.id });
        setTimeout(() => {
          dispatch({ type: actionTypes.REMOVE_TOAST, toastId: toast.id });
          toastTimeouts.current.delete(toast.id);
        }, TOAST_REMOVE_DELAY);
      }, duration);
      toastTimeouts.current.set(toast.id, timeout);
    }

    return {
      id: toast.id,
      dismiss: () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: toast.id }),
      update: (props) =>
        dispatch({ type: actionTypes.UPDATE_TOAST, toast: { ...props, id } }),
    };
  }, []);

  React.useEffect(() => {
    const currentToastTimeouts = toastTimeouts.current;
    return () => {
      currentToastTimeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return {
    ...state,
    toast: addToast,
    dismiss: (toastId) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}

// ToastProvider bileşeni
export const ToastProvider = ({ children }) => {
  const { toasts, toast, dismiss } = useToast();

  const value = React.useMemo(() => ({
    toasts,
    toast,
    dismiss,
  }), [toasts, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
