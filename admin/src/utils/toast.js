// admin/src/utils/toast.js
import toast from 'react-hot-toast';

export const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 3000,
    });
  },
  
  error: (message) => {
    toast.error(message, {
      duration: 4000,
    });
  },
  
  loading: (message) => {
    return toast.loading(message);
  },
  
  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Đang xử lý...',
      success: messages.success || 'Thành công!',
      error: messages.error || 'Có lỗi xảy ra!',
    });
  },
  
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
};

export default showToast;
