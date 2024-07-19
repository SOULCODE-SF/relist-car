/**
 * Template Name: NiceAdmin - v2.4.1
 * Template URL: https://bootstrapmade.com/nice-admin-bootstrap-admin-html-template/
 * Author: BootstrapMade.com
 * License: https://bootstrapmade.com/license/
 */
(function () {
  'use strict';

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach((e) => e.addEventListener(type, listener));
    } else {
      select(el, all).addEventListener(type, listener);
    }
  };

  /**
   * Easy on scroll event listener
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener);
  };

  /**
   * Sidebar toggle
   */
  if (select('.toggle-sidebar-btn')) {
    on('click', '.toggle-sidebar-btn', function (e) {
      select('body').classList.toggle('toggle-sidebar');
    });
  }

  /**
   * Search bar toggle
   */
  if (select('.search-bar-toggle')) {
    on('click', '.search-bar-toggle', function (e) {
      select('.search-bar').classList.toggle('search-bar-show');
    });
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navbarlink.classList.add('active');
      } else {
        navbarlink.classList.remove('active');
      }
    });
  };
  window.addEventListener('load', navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header');
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled');
      } else {
        selectHeader.classList.remove('header-scrolled');
      }
    };
    window.addEventListener('load', headerScrolled);
    onscroll(document, headerScrolled);
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top');
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active');
      } else {
        backtotop.classList.remove('active');
      }
    };
    window.addEventListener('load', toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  /**
   * Initiate tooltips
   */
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  /**
   * Initiate Bootstrap validation check
   */
  var needsValidation = document.querySelectorAll('.needs-validation');

  Array.prototype.slice.call(needsValidation).forEach(function (form) {
    form.addEventListener(
      'submit',
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add('was-validated');
      },
      false
    );
  });

  /**
   * Autoresize echart charts
   */
  const mainContainer = select('#main');
  if (mainContainer) {
    setTimeout(() => {
      new ResizeObserver(function () {
        select('.echart', true).forEach((getEchart) => {
          echarts.getInstanceByDom(getEchart).resize();
        });
      }).observe(mainContainer);
    }, 200);
  }

  function toggleAdsElements() {
    var adsType = document.getElementById('input-ads-type').value;
    var adsCode = document.getElementById('ads-code');
    var adsImage = document.getElementById('ads-image');
    var adsUrl = document.getElementById('ads-url');

    // Hide all elements first
    adsCode.style.display = 'none';
    adsImage.style.display = 'none';
    adsUrl.style.display = 'none';

    // Show the selected element based on ads type
    if (adsType === 'code') {
      adsCode.style.display = 'block';
    } else if (adsType === 'image') {
      adsImage.style.display = 'block';
      adsUrl.style.display = 'block';
    }
  }

  const adsTypeDropdown = document.getElementById('input-ads-type');
  if (adsTypeDropdown) {
    adsTypeDropdown.addEventListener('change', function () {
      toggleAdsElements();
    });

    // Initial call to set initial visibility based on ads type
    toggleAdsElements();
  }

  $(document).ready(function () {
    // Ketika tombol upload gambar diklik
    $('#input-image').change(function () {
      let input = this;
      if (input.files && input.files[0]) {
        let reader = new FileReader();

        reader.onload = function (e) {
          $('#image-preview').attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
      }
    });

    // Ketika tombol remove gambar diklik
    $('#remove-image').click(function (e) {
      e.preventDefault();
      // Reset preview image to default
      $('#image-preview').attr('src', 'assets/img/preview.png');
      // Reset input file (optional)
      $('#input-image').val('');
    });
  });

  $(document).ready(function () {
    // Menangani peristiwa klik pada tab link
    $('#myTab a').on('click', function (e) {
      e.preventDefault();
      $(this).tab('show');
    });
  });
})();
