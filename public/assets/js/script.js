const pageLink = document.querySelectorAll(".menu-scroll");

      pageLink.forEach((elem) => {
        elem.addEventListener("click", (e) => {
          e.preventDefault();
          document.querySelector(elem.getAttribute("href")).scrollIntoView({
            behavior: "smooth",
            offsetTop: 1 - 60,
          });
        });
      });

      // section menu active
      function onScroll(event) {
        const sections = document.querySelectorAll(".menu-scroll");
        const scrollPos =
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop;

        for (let i = 0; i < sections.length; i++) {
          const currLink = sections[i];
          const val = currLink.getAttribute("href");
          const refElement = document.querySelector(val);
          const scrollTopMinus = scrollPos + 73;
          if (
            refElement.offsetTop <= scrollTopMinus &&
            refElement.offsetTop + refElement.offsetHeight > scrollTopMinus
          ) {
            document
              .querySelector(".menu-scroll")
              .classList.remove("active");
            currLink.classList.add("active");
          } else {
            currLink.classList.remove("active");
          }
        }
      }

      window.document.addEventListener("scroll", onScroll);

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

$(document).ready(function () {
  $('#filter-brand').select2({
    placeholder: 'Search for a brand',
    minimumInputLength: 1,
    ajax: {
      url: '/brands-name',
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
  $('#input-brand').select2({
    width: '100%',
    placeholder: 'Search for a brand',
    minimumInputLength: 1,
    ajax: {
      url: '/brands-name',
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

    // Clear current options in model dropdown
    $('#input-model').empty().trigger('change.select2');

    // If no brand selected, exit function
    if (!selectedBrandId) {
      return;
    }

    // AJAX request to fetch models based on selected brand
    $.ajax({
      url: `/models-name/${selectedBrandId}`,
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
      url: `/generations-name/${selectedModelId}`,
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

$(document).ready(function () {
  $('#input-engine').select2({
    placeholder: 'Search for an engine',
    width: '100%',
    ajax: {
      url: '/get-engine',
      dataType: 'json',
      delay: 250,
      data: function (params) {
        console.log('params');
        return {
          search: params.term,
        };
      },
      processResults: function (data) {
        return {
          results: data.datas.map((item) => ({
            id: item.name,
            text: item.name,
          })),
        };
      },
      cache: true,
    },
  });
});

document.addEventListener('DOMContentLoaded', function() {
  function animateCount(element, endValue) {
    const startValue = 0;
    const duration = 2000; // duration in milliseconds
    const stepTime = 10; // time between steps in milliseconds
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

  document.querySelectorAll('[data-count]').forEach(function(el) {
    const endValue = parseInt(el.getAttribute('data-count'), 10);
    animateCount(el, endValue);
  });
});

