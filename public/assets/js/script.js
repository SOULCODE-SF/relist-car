const pageLink = document.querySelectorAll('.menu-scroll');

pageLink.forEach((elem) => {
  elem.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector(elem.getAttribute('href')).scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  });
});

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
      refElement.offsetTop <= scrollTopMinus &&
      refElement.offsetTop + refElement.offsetHeight > scrollTopMinus
    ) {
      document.querySelector('.menu-scroll.active')?.classList.remove('active');
      currLink.classList.add('active');
    } else {
      currLink.classList.remove('active');
    }
  });
}

window.addEventListener('scroll', onScroll);

document.addEventListener('DOMContentLoaded', () => {
  const letterLinks = document.querySelectorAll('.alphabet-list a');

  letterLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('href').replace('#_', '#'); // Adjust target ID
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

$(document).ready(() => {
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

  $('#input-model').select2({ placeholder: 'Select a model', width: '100%' });
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
            $('<option></option>').attr('value', model.id).text(model.name),
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
              .text(generation.name),
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
    placeholder: 'Search for an category',
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
});

document.addEventListener('DOMContentLoaded', () => {
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

  const carLinks = document.querySelectorAll('.car-link');

  carLinks.forEach((link) => {
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
            'An error occurred while checking the car specifications. Please try again later.',
          );
        });
    });
  });
  tinymce.init({
    selector: '#input-content',
    plugins:
      'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount code',
    toolbar:
      'blocks | bold italic underline | alignleft aligncenter alignjustify | numlist bullist | forecolor backcolor removeformat | pagebreak | insertfile image media template link code | code',
    valid_elements: '*[*]',
    extended_valid_elements: 'script[src|type|async]',
    setup: function (editor) {
      editor.on('change', function () {
        editor.save();
      });
    },
  });
  document.getElementById('slug').addEventListener('input', function (event) {
    let inputValue = event.target.value;
    if (/\s/.test(inputValue)) {
      event.target.value = inputValue.replace(/\s+/g, '');
      document.getElementById('error-message').textContent =
        'Spaces are not allowed.';
    } else {
      document.getElementById('error-message').textContent = '';
    }
  });

  const form = document.getElementById('pages-form');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    document.querySelectorAll('.error').forEach((el) => (el.textContent = ''));

    const formData = new FormData(form);

    let hasError = false;
    if (!formData.get('title')) {
      document.getElementById('title-error').textContent = 'Title is required.';
      hasError = true;
    }
    if (!formData.get('slug')) {
      document.getElementById('slug-error').textContent = 'Slug is required.';
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', form.action);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 400) {
        console.log('Form submitted successfully.');
      } else {
        console.error('Server error:', xhr.responseText);
      }
    };
    xhr.onerror = function () {
      console.error('Network error.');
    };
    xhr.send(formData);
  });
});
