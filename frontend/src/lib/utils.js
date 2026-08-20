import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const downloadOrderInvoice = async (api, oid) => {
  const resp = await api.get(`/orders/${oid}/invoice`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([resp.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Jainil_Hair_Studio_Invoice_${oid.slice(0, 8).toUpperCase()}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const openOrderInvoiceInNewTab = async (api, oid) => {
  const resp = await api.get(`/orders/${oid}/invoice`, { responseType: 'blob' });
  const blob = new Blob([resp.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
};

export const printOrderInvoice = async (api, oid) => {
  const resp = await api.get(`/orders/${oid}/invoice`, { responseType: 'blob' });
  const blob = new Blob([resp.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      iframe.remove();
    }, 1000);
  };
};
