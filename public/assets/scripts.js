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

function loadDeferredStyles() {
  var addStylesNode = document.getElementById('deferred-styles');
  var replacement = document.createElement('div');
  replacement.innerHTML = addStylesNode.textContent;
  document.body.appendChild(replacement);
  addStylesNode.parentElement.removeChild(addStylesNode);
}
var raf =
  requestAnimationFrame ||
  mozRequestAnimationFrame ||
  webkitRequestAnimationFrame ||
  msRequestAnimationFrame;
if (raf)
  raf(function () {
    window.setTimeout(loadDeferredStyles, 0);
  });
else window.addEventListener('load', loadDeferredStyles);

$(document).ready(function () {
  $('.owl-carousel').owlCarousel({
    items: 1,
    loop: true,
    nav: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 5000, // Durasi autoplay dalam milidetik (opsional)
    autoplayHoverPause: true, // Jeda autoplay saat kursor berada di atas slider (opsional)
    navText: [
      '<span class="prev-btn">Previous</span>',
      '<span class="next-btn">Next</span>',
    ], // Custom teks untuk tombol navigasi (opsional)
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 1,
      },
      1024: {
        items: 1,
      },
    },
  });
});

$(document).ready(function () {
  // Initialize Select2 for brand dropdown
  $('#filter-brand').select2({
    placeholder: 'Search for a brand',
    minimumInputLength: 1,
    ajax: {
      url: '/admin/brands-name',
      dataType: 'json',
      delay: 250,
      processResults: function (data) {
        return {
          results: data.datas.map((item) => ({
            id: item.id,
            text: item.name,
          })),
        };
      },
      cache: true,
    },
  });

  // When brand selection changes, submit the form
  $('#filter-brand').on('change', function () {
    $('#carFilterForm').submit();
  });
});

$(document).ready(function () {
  // Initialize Select2 for brand dropdown
  $('#input-brand').select2({
    placeholder: 'Search for a brand',
    minimumInputLength: 1,
    ajax: {
      url: '/admin/brands-name',
      dataType: 'json',
      delay: 250,
      processResults: function (data) {
        return {
          results: data.datas.map((item) => ({
            id: item.id,
            text: item.name,
          })),
        };
      },
      cache: true,
    },
  });

  // Initialize Select2 for model dropdown
  $('#input-model').select2({
    placeholder: 'Select a model',
    width: '100%',
  });

  // Initialize Select2 for generation dropdown
  $('#input-generation').select2({
    placeholder: 'Select a generation',
    width: '100%',
  });

  // Event listener for selecting a brand
  $('#input-brand').on('change', function () {
    const selectedBrandId = $(this).val();

    // Clear current options in model dropdown
    $('#input-model').empty().trigger('change.select2');

    // If no brand selected, exit function
    if (!selectedBrandId) {
      return;
    }

    // AJAX request to fetch models based on selected brand
    $.ajax({
      url: `/admin/models-name/${selectedBrandId}`,
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        const models = response.datas;

        // Add new model options to model dropdown
        models.forEach((model) => {
          $('#input-model').append(
            $('<option></option>').attr('value', model.id).text(model.name),
          );
        });

        // Trigger Select2 change after dynamically updating options
        $('#input-model').trigger('change.select2');

        // Automatically trigger the change event on model dropdown
        if (models.length > 0) {
          $('#input-model').val(models[0].id).trigger('change');
        }
      },
      error: function (error) {
        console.error('Error fetching models:', error);
      },
    });
  });

  // Event listener for selecting a model
  $('#input-model').on('change', function () {
    const selectedModelId = $(this).val();

    // Clear current options in generation dropdown
    $('#input-generation').empty().trigger('change.select2');

    // If no model selected, exit function
    if (!selectedModelId) {
      return;
    }

    // AJAX request to fetch generations based on selected model
    $.ajax({
      url: `/admin/generations-name/${selectedModelId}`,
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        const generations = response.datas;

        // Add new generation options to generation dropdown
        generations.forEach((generation) => {
          $('#input-generation').append(
            $('<option></option>')
              .attr('value', generation.id)
              .text(generation.name),
          );
        });

        // Trigger Select2 change after dynamically updating options
        $('#input-generation').trigger('change.select2');
      },
      error: function (error) {
        console.error('Error fetching generations:', error);
      },
    });
  });
});
