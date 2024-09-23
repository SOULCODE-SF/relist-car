document.addEventListener('DOMContentLoaded', () => {
  // Menu Scroll Smooth Behavior
  const pageLinks = document.querySelectorAll('.menu-scroll');

  pageLinks.forEach((elem) => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(elem.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // Scroll Active Menu
  function onScroll() {
    const sections = document.querySelectorAll('.menu-scroll');
    const scrollPos =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;

    sections.forEach((currLink) => {
      const val = currLink.getAttribute('href');
      const refElement = document.querySelector(val);
      const scrollTopMinus = scrollPos + 73;

      if (
        refElement &&
        refElement.offsetTop <= scrollTopMinus &&
        refElement.offsetTop + refElement.offsetHeight > scrollTopMinus
      ) {
        document
          .querySelector('.menu-scroll.active')
          ?.classList.remove('active');
        currLink.classList.add('active');
      } else {
        currLink.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll);

  // Letter Links Smooth Scroll
  document.querySelectorAll('.alphabet-list a').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('href').replace('#_', '#'); // Adjust target ID
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Select2 Initialization
  $('#filter-brand')
    .select2({
      placeholder: 'Search for a brand',
      minimumInputLength: 1,
      ajax: {
        url: '/brands-name',
        dataType: 'json',
        delay: 250,
        processResults: (data) => ({
          results: data.datas.map((item) => ({
            id: item.id,
            text: item.name,
          })),
        }),
        cache: true,
      },
    })
    .on('change', () => $('#carFilterForm').submit());

  $('#input-brand').select2({
    width: '100%',
    placeholder: 'Search for a brand',
    minimumInputLength: 1,
    ajax: {
      url: '/brands-name',
      dataType: 'json',
      delay: 250,
      processResults: (data) => ({
        results: data.datas.map((item) => ({
          id: item.id,
          text: item.name,
        })),
      }),
      cache: true,
    },
  });

  $('#input-model').select2({
    placeholder: 'Select a model',
    width: '100%',
  });

  $('#input-generation').select2({
    placeholder: 'Select a generation',
    width: '100%',
  });

  $('#input-brand').on('change', function () {
    const selectedBrandId = $(this).val();
    $('#input-model').empty().trigger('change.select2');

    if (!selectedBrandId) return;

    $.ajax({
      url: `/models-name/${selectedBrandId}`,
      method: 'GET',
      dataType: 'json',
      success: (response) => {
        const models = response.datas;
        models.forEach((model) => {
          $('#input-model').append(
            $('<option></option>').attr('value', model.id).text(model.name)
          );
        });
        $('#input-model').trigger('change.select2');
        if (models.length > 0) {
          $('#input-model').val(models[0].id).trigger('change');
        }
      },
      error: (error) => console.error('Error fetching models:', error),
    });
  });

  $('#input-model').on('change', function () {
    const selectedModelId = $(this).val();
    $('#input-generation').empty().trigger('change.select2');

    if (!selectedModelId) return;

    $.ajax({
      url: `/generations-name/${selectedModelId}`,
      method: 'GET',
      dataType: 'json',
      success: (response) => {
        const generations = response.datas;
        generations.forEach((generation) => {
          $('#input-generation').append(
            $('<option></option>')
              .attr('value', generation.id)
              .text(generation.name)
          );
        });
        $('#input-generation').trigger('change.select2');
      },
      error: (error) => console.error('Error fetching generations:', error),
    });
  });

  $('#input-engine').select2({
    placeholder: 'Search for an engine',
    width: '100%',
    ajax: {
      url: '/get-engine',
      dataType: 'json',
      delay: 250,
      processResults: (data) => ({
        results: data.datas.map((item) => ({
          id: item.name,
          text: item.name,
        })),
      }),
      cache: true,
    },
  });

  $('#input-country').select2({
    width: '100%',
    placeholder: 'Select your country',
    minimumInputLength: 1,
    ajax: {
      url: '/countries',
      dataType: 'json',
      delay: 250,
      processResults: (data) => ({
        results: data.data.map((item) => ({
          id: item.code,
          text: item.name,
        })),
      }),
      cache: true,
    },
  });

  $('#input-category').select2({
    placeholder: 'Search for a category',
    width: '100%',
    ajax: {
      url: '/blog/categories',
      dataType: 'json',
      delay: 250,
      processResults: (data) => ({
        results: data.datas.map((item) => ({
          id: item.id,
          text: item.name,
        })),
      }),
      cache: true,
    },
  });

  function animateCount(element, endValue) {
    const startValue = 0;
    const duration = 2000;
    const stepTime = 10;
    const stepCount = Math.floor(duration / stepTime);
    const stepValue = endValue / stepCount;
    let currentValue = startValue;

    function updateCounter() {
      currentValue += stepValue;
      if (currentValue >= endValue) {
        element.textContent = endValue;
        return;
      }
      element.textContent = Math.floor(currentValue);
      setTimeout(updateCounter, stepTime);
    }

    updateCounter();
  }

  document.querySelectorAll('[data-count]').forEach((el) => {
    const endValue = parseInt(el.getAttribute('data-count'), 10);
    animateCount(el, endValue);
  });

  // Car Link Handling
  document.querySelectorAll('.car-link').forEach((link) => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const url = this.dataset.url;

      fetch('/check-car?url=' + encodeURIComponent(url))
        .then((response) => response.json())
        .then((data) => {
          window.location.href = data.url;
        })
        .catch((error) => {
          console.error('Error:', error);
          alert(
            'An error occurred while checking the car specifications. Please try again later.'
          );
        });
    });
  });

  // TinyMCE Initialization
  tinymce.init({
    selector: '#input-content',
    plugins:
      'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount code',
    toolbar:
      'blocks | bold italic underline | alignleft aligncenter alignjustify | numlist bullist | forecolor backcolor removeformat | pagebreak | insertfile image media template link | code',
    valid_elements: '*[*]',
    extended_valid_elements: 'script[src|type|async]',
    setup: (editor) => {
      editor.on('change', () => {
        editor.save();
      });
    },
  });

  function createSlugValidator(
    formId,
    slugInputId,
    errorMessageId,
    checkUrl,
    id
  ) {
    const form = document.getElementById(formId);
    const slugInput = document.getElementById(slugInputId);
    const errorMessage = document.getElementById(errorMessageId);
    const submitButton = form?.querySelector('button[type="submit"]');
    console.log('form', form);

    if (!form || !slugInput || !errorMessage || !submitButton) {
      console.error(`Initialization failed for form ${formId}.`);
      return;
    }

    async function validateSlug() {
      const slug = slugInput.value.trim();

      if (/\s/.test(slug)) {
        errorMessage.textContent = 'Slug cannot contain spaces.';
        submitButton.disabled = true;
        return false;
      }

      if (!slug) {
        errorMessage.textContent = 'Slug is required.';
        submitButton.disabled = true;
        return false;
      }

      try {
        const response = await fetch(
          `${checkUrl}?slug=${encodeURIComponent(slug)}&id=${detailId}`
        );
        const data = await response.json();

        if (data.message === 'Slug Already Use') {
          errorMessage.textContent = 'Slug is already taken.';
          submitButton.disabled = true;
          return false;
        } else {
          errorMessage.textContent = '';
          submitButton.disabled = false;
          return true;
        }
      } catch (error) {
        console.error('Error checking slug:', error);
        errorMessage.textContent =
          'An error occurred while validating the slug.';
        submitButton.disabled = true;
        return false;
      }
    }

    form.addEventListener('submit', async (event) => {
      const isSlugValid = await validateSlug();
      if (!isSlugValid) {
        event.preventDefault();
      }
    });

    slugInput.addEventListener('input', async () => {
      await validateSlug();
    });

    validateSlug();
  }

  const fullUrl = window.location.href;
  const segments = fullUrl.split('/');
  const detailId = segments[segments.length - 1];

  if (fullUrl.includes('add-posts') || fullUrl.includes('edit-posts')) {
    createSlugValidator(
      'posts-form',
      'slug',
      'posts-error-message',
      '/blog/check-slug',
      detailId
    );
  }

  if (
    fullUrl.includes('/admin/add-pages') ||
    fullUrl.includes('/admin/edit-pages')
  ) {
    createSlugValidator(
      'pages-form',
      'page-slug',
      'pages-error-message',
      '/pages/check-slug'
    );
  }

  if ($.fn.dataTable.isDataTable('#datatable')) {
    $('#datatable').DataTable().destroy();
  }

  $('#datatable').DataTable({
    columnDefs: [{ orderable: false, targets: 'no-sort' }],
  });

  const input = document.querySelector('#tags');
  new Tagify(input);
});
