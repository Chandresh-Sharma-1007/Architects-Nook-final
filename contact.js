// ==========================================================================
// CONTACT FORM CONFIGURATION
// ==========================================================================
const CONTACT_CONFIG = {
  googleFormAction: "https://docs.google.com/forms/d/e/1FAIpQLSfIsIXbKESfAhUBo7Xlu1RnXgBNg9Bn8XZT-lbzivR-r1skrw/formResponse",
  fields: {
    name: "entry.1299557800",
    phone: "entry.145965579",
    email: "entry.1662735159",
    message: "entry.1144101200"
  }
};

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================
// Note: DOM elements are queried dynamically during form interaction.

// ==========================================================================
// FORM VALIDATION
// ==========================================================================
function validateField(form, fieldId, value) {
  let isValid = true;
  let errorMsg = '';

  if (fieldId === 'name') {
    if (!value) {
      isValid = false;
      errorMsg = 'NAME IS REQUIRED';
    }
  } else if (fieldId === 'phone') {
    if (!value) {
      isValid = false;
      errorMsg = 'PHONE NUMBER IS REQUIRED';
    } else {
      // Clean spacing, dashes, and parentheses to validate digits
      const cleaned = value.replace(/[\s\-()]/g, '');
      const phoneRegex = /^(?:\+?91|0)?[6-9]\d{9}$|^(?:\+?91|0)?\d{2,4}\d{6,8}$/;
      if (!phoneRegex.test(cleaned)) {
        isValid = false;
        errorMsg = 'ENTER A VALID PHONE NUMBER';
      }
    }
  } else if (fieldId === 'email') {
    if (!value) {
      isValid = false;
      errorMsg = 'EMAIL ADDRESS IS REQUIRED';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMsg = 'ENTER A VALID EMAIL ADDRESS';
      }
    }
  } else if (fieldId === 'message') {
    if (!value) {
      isValid = false;
      errorMsg = 'MESSAGE IS REQUIRED';
    }
  }

  if (isValid) {
    clearFieldError(form, fieldId);
  } else {
    showFieldError(form, fieldId, errorMsg);
  }

  return isValid;
}

function clearFieldError(form, fieldId) {
  const field = form.querySelector(`#${fieldId}`);
  if (field) {
    field.classList.remove('input-error');
    const parent = field.parentElement;
    const errorMsg = parent.querySelector('.form-error-msg');
    if (errorMsg) {
      errorMsg.textContent = '';
      errorMsg.style.display = 'none';
    }
  }
}

function showFieldError(form, fieldId, msg) {
  const field = form.querySelector(`#${fieldId}`);
  if (field) {
    field.classList.add('input-error');
    const parent = field.parentElement;
    let errorMsg = parent.querySelector('.form-error-msg');
    if (!errorMsg) {
      errorMsg = document.createElement('span');
      errorMsg.className = 'form-error-msg';
      parent.appendChild(errorMsg);
    }
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
  }
}

function validateContactForm(form, name, phone, email, message) {
  let hasError = false;

  if (!validateField(form, 'name', name)) {
    hasError = true;
  }
  if (!validateField(form, 'phone', phone)) {
    hasError = true;
  }
  if (!validateField(form, 'email', email)) {
    hasError = true;
  }
  if (!validateField(form, 'message', message)) {
    hasError = true;
  }

  return !hasError;
}

// ==========================================================================
// SUCCESS STATE
// ==========================================================================
function showContactSuccess(form) {
  const successCard = document.getElementById('contact-success-state');
  if (successCard) {
    form.style.display = 'none';
    successCard.style.display = 'block';
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(successCard, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    }
    const formContainer = document.querySelector('.contact-right');
    if (formContainer) {
      formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

// ==========================================================================
// FORM INITIALIZATION
// ==========================================================================
function initContactForm() {
  const form = document.getElementById('contact-enquiry-form');
  if (!form) return;

  // Add event listeners to remove error state when user corrects fields
  const fields = ['name', 'phone', 'email', 'message'];
  fields.forEach(fieldId => {
    const input = form.querySelector(`#${fieldId}`);
    if (input) {
      input.addEventListener('input', () => {
        validateField(form, fieldId, input.value.trim());
      });
      input.addEventListener('change', () => {
        validateField(form, fieldId, input.value.trim());
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    // Validate fields
    if (!validateContactForm(form, name, phone, email, message)) return;

    // Submit to Google Forms via hidden iframe to avoid CORS issues
    let iframe = document.getElementById('hidden-google-form-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'hidden-google-form-iframe';
      iframe.name = 'hidden-google-form-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    const hiddenForm = document.createElement('form');
    hiddenForm.method = 'POST';
    hiddenForm.action = CONTACT_CONFIG.googleFormAction;
    hiddenForm.target = 'hidden-google-form-iframe';

    const fieldMap = {
      [CONTACT_CONFIG.fields.name]: name,
      [CONTACT_CONFIG.fields.phone]: phone,
      [CONTACT_CONFIG.fields.email]: email,
      [CONTACT_CONFIG.fields.message]: message,
    };

    Object.entries(fieldMap).forEach(([entryKey, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = entryKey;
      input.value = value;
      hiddenForm.appendChild(input);
    });

    document.body.appendChild(hiddenForm);
    hiddenForm.submit();
    document.body.removeChild(hiddenForm);

    // Show success state immediately (optimistic UI — Google Forms accepts the POST)
    showContactSuccess(form);
  });
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initContactForm();
});


