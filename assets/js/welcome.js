import $ from 'jquery';
import M from 'materialize-css';
import 'CSS/welcome.scss';

let updatingChips = false;
/** @type {?JQuery} */
let $chipSet = null;
/** @type {?JQuery} */
let $prodQtyModal = null;

$(() => {
  const $filters = $('#filter-options .chip');
  $chipSet = $('.chip');
  // const $allFilter = $filters.find('[data-category="all"]');
  $prodQtyModal = $('#product-popup');

  M.Modal.init($prodQtyModal, {
    onCloseStart: () => clearModal(),
    onOpenEnd: () => $prodQtyModal.scrollTop(0),
  });

  $filters.on('click', (e) => {
    updateFilterStates(e);
    filterProductCards();
  });

  $('.sticker-container').on('click', (e) => {
    const $product = $(e.currentTarget);
    updateProdModal({
      shortName: $product.data('product'),
      title: $product.data('title'),
      description: $product.data('description'),
      imagePath: $product.find('.prod-image').attr('src'),
      imageAlt: $product.find('.prod-image').attr('alt'),
    });
  });
});

/**
 * @param {string[]} categories
 * @param {boolean} [exclusive=false] - When true, returns all chips except the provided chipIds
 * @returns {JQuery}
 */
function getChipByCategories(categories, exclusive = false) {
  return $chipSet.filter((_, chip) => {
    const inList = categories.includes(chip.dataset.category);
    return (inList && !exclusive) || (!inList && exclusive);
  });
}

/**
 * @returns {JQuery}
 */
function getSelectedChips() {
  return $chipSet.filter((_, chip) => chip.classList.contains('selected'));
}

/**
 * @param {JQuery.TriggeredEvent} e
 */
function updateFilterStates(e) {
  if (updatingChips) {
    return;
  }

  updatingChips = true;
  const chip = /** @type {HTMLElement} */(e.currentTarget);
  const selected = !chip.classList.contains('selected');
  const $allChip = getChipByCategories(['all']).first();
  const selectedChipCategory = chip.dataset.category;

  $(chip).toggleClass('selected', selected);

  // If the All-filter was toggled, need to (un)toggle all the other chips
  if (selectedChipCategory === 'all') {
    getChipByCategories([chip.dataset.category], true).each((_, thisChip) => {
      $(thisChip).toggleClass('selected', selected);
    });
  } else {
    // Basically, we're checking if the chip was selected, and was the last of the chip categories
    const onlyAllChipNotSelected = ($chipSet.length - getSelectedChips().length) === 1;
    const allCategoriesSelected = selected && onlyAllChipNotSelected;

    $allChip.toggleClass('selected', allCategoriesSelected);
  }

  updatingChips = false;
}

/**
 * Hides/shows cards based on what chips are selected.
 */
function filterProductCards() {
  const selectedChips = getSelectedChips();
  const chipsSelected = selectedChips.length > 0;
  const $productCards = $('.product-card');

  $productCards.each((_, cardElem) => {
    const $card = $(cardElem);
    const categories = $card.data('category').split(' ');
    const matches = selectedChips
      // @ts-ignore
      .filter((__, chip) => categories.includes(chip.dataset.category));

    const hideCard = matches.length === 0 && chipsSelected;
    $card.toggleClass('hide', hideCard);
  });
}

/**
 * @param {{shortName: string, title: string, description: string, imagePath: string, imageAlt: string}} data
 */
function updateProdModal(data) {
  $prodQtyModal.data('product', data.shortName);
  $prodQtyModal.find('#prod-image').attr({ src: data.imagePath, alt: data.imageAlt });
  $prodQtyModal.find('#prod-title').html(data.title);
  $prodQtyModal.find('#prod-description').html(data.description);
  $prodQtyModal.find('#small-size-count').val(null);
  $prodQtyModal.find('#large-size-count').val(null);
}

/**
 * @returns {void}
 */
function clearModal() {
  $prodQtyModal.data('product', null);
  $prodQtyModal.find('#prod-image').attr({ src: null, alt: null });
  $prodQtyModal.find('#prod-title').html('');
  $prodQtyModal.find('#prod-description').html('');
  $prodQtyModal.find('#small-size-count').val(null);
  $prodQtyModal.find('#large-size-count').val(null);
}
