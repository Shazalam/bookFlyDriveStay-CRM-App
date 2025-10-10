import { toast, ToastOptions } from "react-hot-toast";


export function useToastHandler() {

  const showLoadingToast = (message: string, id: string = "global-toast") => {
    return toast.loading(message, { id });
  }

  const handleSuccessToast = (
    message: string,
    options?: string | ToastOptions
  ) => {
    if (typeof options === "string") {
      toast.success(message, { id: options });
    } else {
      toast.success(message, options);
    }
  };

  const handleErrorToast = (message: string, options?: string | ToastOptions) => {
    if (typeof options === "string") {
      return toast.error(message, { id: options });
    }else {
      return toast.error(message, options);
    }
  }

  const handleDismissToast = (id: string = "global-toast") => {
    toast.dismiss(id);
  }

  return {
    showLoadingToast,
    handleSuccessToast,
    handleErrorToast,
    handleDismissToast
  };
}


