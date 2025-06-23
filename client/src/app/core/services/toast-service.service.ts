import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.className = `alert alert-${type} shadow-lg animate-fade-in`;
    wrapper.innerHTML = `
        <span>${message}</span>
    `;

    container.appendChild(wrapper);

    setTimeout(() => {
      wrapper.classList.add('animate-fade-out');
      setTimeout(() => container.removeChild(wrapper), 500);
    }, 3000);

    console.log(`ToastService: ${message} (${type})`);
  }
}
