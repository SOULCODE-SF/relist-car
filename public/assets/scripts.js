// assets/scripts.js

document.addEventListener('DOMContentLoaded', function () {
  initializeScrollAnimation();
});

function initializeScrollAnimation() {
  const letterLinks = document.querySelectorAll('.alphabet-list a');

  letterLinks.forEach((link) => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const targetId = this.getAttribute('href').replace('#_', '#'); // Menghapus `_` dari ID target
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
