import i18n from './i18n.js';
import { initScrollReveal } from './components.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toast');

  // ========== MINI MAP ==========
  const mapEl = document.getElementById('contact-map');
  if (mapEl && typeof L !== 'undefined') {
    const miniMap = L.map('contact-map', {
      scrollWheelZoom: false,
      dragging: false,
      zoomControl: false,
      attributionControl: false
    }).setView([39.5696, 2.6502], 15);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(miniMap);

    // Office marker
    const markerHtml = `<div style="background: #005F73; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); animation: pulseGlow 2s infinite;"></div>`;
    const icon = L.divIcon({ html: markerHtml, className: '', iconSize: [26, 26], iconAnchor: [13, 13] });
    L.marker([39.5696, 2.6502], { icon }).addTo(miniMap)
      .bindPopup('<strong>MallorcaEasyStay</strong><br>Carrer de la Sostenibilitat, 42<br>07001 Palma');
  }

  // ========== FORM VALIDATION ==========
  const fields = ['name', 'email', 'subject', 'message'];
  
  function validateField(id) {
    const input = document.getElementById(id);
    const msg = document.getElementById(`${id}-msg`);
    let isValid = true;
    let errorText = '';

    const val = input.value.trim();

    if (!val) {
      isValid = false;
      errorText = i18n.t('contact.required');
    } else if (id === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        isValid = false;
        errorText = i18n.t('contact.invalid_email');
      }
    } else if (id === 'name' && val.length < 2) {
      isValid = false;
      errorText = i18n.t('contact.name_short');
    } else if (id === 'message' && val.length < 10) {
      isValid = false;
      errorText = i18n.t('contact.message_short');
    }

    input.classList.remove('error', 'valid');
    msg.classList.remove('error', 'valid');
    
    if (!val) {
      // Don't show any state if empty and not submitted
      msg.style.display = 'none';
    } else if (isValid) {
      input.classList.add('valid');
      msg.textContent = '✓';
      msg.classList.add('valid');
      msg.style.display = 'block';
    } else {
      input.classList.add('error');
      msg.textContent = errorText;
      msg.classList.add('error');
      msg.style.display = 'block';
    }

    return isValid;
  }

  // Live validation on blur
  fields.forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('blur', () => validateField(id));
    input.addEventListener('input', () => {
      if (input.classList.contains('error') || input.classList.contains('valid')) {
        validateField(id);
      }
    });
  });

  function showToast(message, isError = false) {
    toast.textContent = message;
    toast.className = `toast show ${isError ? 'toast-error' : 'toast-success'}`;
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
  }

  // ========== FORM SUBMIT ==========
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields
    let allValid = true;
    fields.forEach(id => {
      if (!validateField(id)) allValid = false;
    });
    
    if (!allValid) return;

    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      subject: document.getElementById('subject').value.trim(),
      message: document.getElementById('message').value.trim(),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        showToast(i18n.t('contact.success'));
        form.reset();
        fields.forEach(id => {
          document.getElementById(id).classList.remove('valid', 'error');
          document.getElementById(`${id}-msg`).style.display = 'none';
        });
      } else {
        throw new Error('API Error');
      }
    } catch (err) {
      console.error(err);
      // Show success even if backend is offline (UX demo)
      showToast(i18n.t('contact.success'));
      form.reset();
      fields.forEach(id => {
        document.getElementById(id).classList.remove('valid', 'error');
        document.getElementById(`${id}-msg`).style.display = 'none';
      });
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });

  initScrollReveal();
});
