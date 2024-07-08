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

$(document).ready(function () {
  // Inisialisasi Select2 untuk dropdown merek
  $('#input-brand').select2({
    placeholder: 'Search for a brand',
    minimumInputLength: 1,
    ajax: {
      url: '/admin/brands-name?q=',
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

  // Event listener untuk mengambil models berdasarkan brand yang dipilih
  $('#input-brand').on('change', function () {
    const selectedBrandId = $(this).val();

    // Kosongkan opsi saat ini di dropdown model
    $('#input-model').empty();

    // Jika tidak ada merek yang dipilih, keluar dari fungsi
    if (!selectedBrandId) {
      return;
    }

    // Lakukan permintaan AJAX untuk mendapatkan models berdasarkan merek yang dipilih
    $.ajax({
      url: `/admin/models-name/${selectedBrandId}?q=`,
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        const models = response.datas; // Menyesuaikan dengan struktur respons dari getModelName

        // Tambahkan opsi model baru ke dropdown model
        models.forEach((model) => {
          $('#input-model').append(
            $('<option></option>').attr('value', model.id).text(model.name),
          );
        });

        // Refresh Select2 setelah mengubah opsi secara dinamis
        $('#input-model').trigger('change.select2');
      },
      error: function (error) {
        console.error('Error fetching models:', error);
      },
    });
  });

  // Inisialisasi Select2 untuk dropdown model
  $('#input-model').select2({
    placeholder: 'Select a model',
    width: '100%',
  });
});
