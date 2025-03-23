$(document).ready(function() {
    $('.filter-btn').click(function() {
      // Remove active-filter class from all buttons and add to current button.
      $('.filter-btn').removeClass('active-filter');
      $(this).addClass('active-filter');

      // Get the filter keyword from the clicked button.
      const filter = $(this).data('filter');

      // Show all cards if "all" is selected; otherwise filter the cards.
      if (filter === "all") {
        $('.playground-card').show();
      } else {
        $('.playground-card').hide();
        $('.playground-card').each(function() {
          // Split tags by comma, trim extra whitespace.
          const tags = $(this).data('tags').split(',').map(tag => tag.trim());
          // If the card's tags include the selected filter, show it.
          if (tags.indexOf(filter) !== -1) {
            $(this).show();
          }
        });
      }
    });
  });
