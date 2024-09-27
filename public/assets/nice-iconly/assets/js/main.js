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
    return all
      ? [...document.querySelectorAll(el)]
      : document.querySelector(el);
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    const elements = select(el, all);
    if (all) {
      elements.forEach((e) => e.addEventListener(type, listener));
    } else {
      elements.addEventListener(type, listener);
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
    on('click', '.toggle-sidebar-btn', () => {
      select('body').classList.toggle('toggle-sidebar');
    });
  }

  /**
   * Search bar toggle
   */
  if (select('.search-bar-toggle')) {
    on('click', '.search-bar-toggle', () => {
      select('.search-bar').classList.toggle('search-bar-show');
    });
  }

  /**
   * Navbar links active state on scroll
   */
  const navbarlinks = select('#navbar .scrollto', true);
  const updateNavbarLinksActiveState = () => {
    const position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;
      const section = select(navbarlink.hash);
      if (!section) return;
      navbarlink.classList.toggle(
        'active',
        position >= section.offsetTop &&
          position <= section.offsetTop + section.offsetHeight
      );
    });
  };
  window.addEventListener('load', updateNavbarLinksActiveState);
  onscroll(document, updateNavbarLinksActiveState);

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  const selectHeader = select('#header');
  if (selectHeader) {
    const updateHeaderScrolled = () => {
      selectHeader.classList.toggle('header-scrolled', window.scrollY > 100);
    };
    window.addEventListener('load', updateHeaderScrolled);
    onscroll(document, updateHeaderScrolled);
  }

  /**
   * Back to top button
   */
  const backToTop = select('.back-to-top');
  if (backToTop) {
    const toggleBackToTopButton = () => {
      backToTop.classList.toggle('active', window.scrollY > 100);
    };
    window.addEventListener('load', toggleBackToTopButton);
    onscroll(document, toggleBackToTopButton);
  }

  /**
   * Initiate tooltips
   */
  const tooltipTriggerList = [
    ...document.querySelectorAll('[data-bs-toggle="tooltip"]'),
  ];
  tooltipTriggerList.forEach(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  /**
   * Initiate Bootstrap validation check
   */
  const needsValidation = [...document.querySelectorAll('.needs-validation')];
  needsValidation.forEach((form) => {
    form.addEventListener('submit', (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });

  /**
   * Autoresize echart charts
   */
  const mainContainer = select('#main');
  if (mainContainer) {
    setTimeout(() => {
      new ResizeObserver(() => {
        select('.echart', true).forEach((echart) => {
          echarts.getInstanceByDom(echart).resize();
        });
      }).observe(mainContainer);
    }, 200);
  }

  /**
   * Toggle advertisement elements
   */
  const toggleAdsElements = () => {
    const adsType = document.getElementById('input-ads-type').value;
    const adsCode = document.getElementById('ads-code');
    const adsImage = document.getElementById('ads-image');
    const adsUrl = document.getElementById('ads-url');

    adsCode.style.display = 'none';
    adsImage.style.display = 'none';
    adsUrl.style.display = 'none';

    if (adsType === 'code') {
      adsCode.style.display = 'inline';
    } else if (adsType === 'image') {
      adsImage.style.display = 'inline';
      adsUrl.style.display = 'inline';
    }
  };

  const adsTypeDropdown = document.getElementById('input-ads-type');
  if (adsTypeDropdown) {
    adsTypeDropdown.addEventListener('change', toggleAdsElements);
    toggleAdsElements();
  }

  /**
   * Image preview and removal
   */
  $(document).ready(() => {
    // Handle image preview
    $('#input-image').change(function () {
      const input = this;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          $('#image-preview').attr('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
      }
    });

    $('#remove-image').click((e) => {
      e.preventDefault();
      $('#image-preview').attr(
        'src',
        '/assets/nice-iconly/assets/img/preview.png'
      ); // Set default image
      $('#input-image').val(''); // Clear the input value
    });

    // Handle favicon preview
    $('#input-favicon').change(function () {
      const input = this;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          $('#favicon-preview').attr('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
      }
    });

    $('#remove-favicon').click((e) => {
      e.preventDefault();
      $('#favicon-preview').attr('src', 'assets/img/preview.png'); // Set default favicon
      $('#input-favicon').val(''); // Clear the input value
    });
  });

  /**
   * Tab navigation
   */
  $(document).ready(() => {
    $('#myTab a').on('click', function (e) {
      e.preventDefault();
      $(this).tab('show');
    });
  });

  /**
   * Powertrain architecture management
   */
  document
    .getElementById('input-powertrain-architecture')
    .addEventListener('change', function () {
      const newArchDiv = document.getElementById('new-powertrain-architecture');
      newArchDiv.style.display = this.value === 'add-new' ? 'block' : 'none';
    });

  /**
   * Electric motors management
   */
  let motorCount = 0;
  document.getElementById('add-motor').addEventListener('click', () => {
    if (motorCount < 2) {
      motorCount++;
      const motorId = `electric_motor_${motorCount}`;
      document.getElementById(motorId).style.display = 'grid';
    } else {
      alert('You can only add up to 2 electric motors.');
    }
  });

  //adtional image
  const addImageButton = $('#add-image-button');
  const imageUploadFieldsContainer = $('#image-upload-fields');
  const maxFields = 5;

  addImageButton.click(() => {
    const currentFieldsCount = imageUploadFieldsContainer.find(
      '.image-upload-field'
    ).length;

    if (currentFieldsCount >= maxFields) {
      alert('You can only add up to 5 image upload fields.');
      return;
    }

    const newField = $(`
      <div class="image-upload-field mb-2 mt-2">
        <div class="additional-image-preview-container">
          <img
            class="additional-image-preview"
            src="/assets/nice-iconly/assets/img/preview.png"
            class="img-thumbnail"
            alt="Additional Image Preview"
          />
        </div>
        <div class="pt-2">
          <label class="btn btn-primary btn-sm" title="Upload image">
            <i class="icon-upload"></i>
            <input
              name="additional_car_images"
              type="file"
              class="input-additional-image"
              accept="image/*"
              style="display: none"
            />
          </label>
          <a href="#" class="btn btn-danger btn-sm remove-additional-image" title="Remove image">
            <i class="icon-trash-alt"></i>
          </a>
        </div>
      </div>
    `);

    imageUploadFieldsContainer.append(newField);

    // Handle image preview for the newly added field
    newField.find('.input-additional-image').change(function () {
      const input = this;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newField
            .find('.additional-image-preview')
            .attr('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
      }
    });

    // Remove additional image field
    newField.find('.remove-additional-image').click(function (e) {
      e.preventDefault();
      newField.remove(); // Remove the field
    });
  });

  // Handle the first additional image preview
  $('.input-additional-image').change(function () {
    const input = this;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        $(this)
          .closest('.image-upload-field')
          .find('.additional-image-preview')
          .attr('src', e.target.result);
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  const fileInputs = document.querySelectorAll('.input-additional-image');

  fileInputs.forEach((input) => {
    input.addEventListener('change', function () {
      const id = this.getAttribute('data-id');
      const existingHiddenInput = this.form.querySelector(
        `input[name="existing_additional_images_ids[]"][data-id="${id}"]`
      );

      // Check if a file is uploaded
      if (this.files.length > 0) {
        // If a file is selected, add the ID to a hidden input
        if (!existingHiddenInput) {
          const newHiddenInput = document.createElement('input');
          newHiddenInput.type = 'hidden';
          newHiddenInput.name = 'existing_additional_images_ids[]';
          newHiddenInput.value = id;
          newHiddenInput.setAttribute('data-id', id);
          this.parentElement.appendChild(newHiddenInput); // Append to the current input's parent
        }
      } else {
        // If no file is selected, remove the hidden input if it exists
        if (existingHiddenInput) {
          existingHiddenInput.remove();
        }
      }
    });
  });
})();
