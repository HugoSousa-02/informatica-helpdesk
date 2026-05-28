import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente Toast (usa react-toastify internamente)
const Toast = () => {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  );
};

export default Toast;