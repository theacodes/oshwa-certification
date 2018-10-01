const ListFilter = {
  options: {
    valueNames: [
      'name',
      'uid',
      'version',
      'keywords',
      'responsible-party',
      { name: 'date', attr: 'date' },
      { name: 'type', attr: 'type' },
      { name: 'hardware', attr: 'hardware' },
      { name: 'documentation', attr: 'documentation' },
      { name: 'software', attr: 'software' },
      { name: 'location', attr: 'location' }
    ],
    fuzzySearch: {
      searchClass: 'fuzzy-search',
      location: 0,
      distance: 100,
      threshold: 0.2,
      multiSearch: true
    }
  },
  projectList: undefined,
  searchString: '',
  allFilters: undefined,
  searchQueries: { software: 'all', hardware: 'all' },
  typeCheckedValues: [],
  location: 'all',
  activeTag: undefined,
  createList: () => {
    ListFilter.projectList = new List('project_data', ListFilter.options);

    if (document.location.href.indexOf('list') > -1) {
      ListFilter.projectList.sort('name', { order: 'asc' });
    }
  },
  filterList: () => {
    ListFilter.projectList.search(ListFilter.searchString);
    ListFilter.projectList.filter(item => {
      if (
        item.values().hardware !== null &&
        item.values().software !== null &&
        item.values().type !== null &&
        item.values().location !== null &&
        item.values().hardware.indexOf(ListFilter.searchQueries.hardware) !== -1 &&
        item.values().software.indexOf(ListFilter.searchQueries.software) !== -1 &&
        item.values().location.indexOf(ListFilter.location) !== -1 &&
        ListFilter.matchesAllItems(item.values().type, ListFilter.typeCheckedValues)
      ) {
        return true;
      }
    });

    ListFilter.displayResults();
    ListFilter.displayResultQueries();
  },
  filterBySearch: () => {
    $('#searchfield').on('keyup', e => {
      ListFilter.searchString = $(e.currentTarget).val();
      ListFilter.filterList();
    });
  },
  filterByDropdowns: () => {
    ListFilter.allFilters = $('.dropdown');

    ListFilter.allFilters.on('change', e => {
      ListFilter.allFilters.each(selection => {
        $(selection).each(() => {
          const filterSelection = e.currentTarget.id;
          const selectedOption = $(e.currentTarget).children(':selected').attr('id');

          ListFilter.searchQueries[filterSelection] = selectedOption;
        });
      });
      ListFilter.filterList();
    });
  },
  filterByLocation: () => {
    $('.country-dropdown').on('change', e => {
      ListFilter.location = $(e.currentTarget).children(':selected').attr('id');
      ListFilter.filterList();
    });
  },
  mapCheckBoxes: () => {
    ListFilter.typeCheckedValues = $('input[type="checkbox"]:checked')
      .map(function() {
        return this.value;
      }).get();

    if (ListFilter.typeCheckedValues.length === 0) {
      ListFilter.typeCheckedValues = ['all'];
    }

    ListFilter.filterList();
  },
  filterByCheckboxes: () => {
    $('.filter-container').on('change', () => {
      ListFilter.mapCheckBoxes();
    });
  },
  matchesAllItems: (arr1, arr2) => {
    let matchesAll;
    let largerArray;
    let smallerArray;
    if (arr1.length > arr2.length) {
      largerArray = arr1;
      smallerArray = arr2;
    } else {
      largerArray = arr2;
      smallerArray = arr1;
    }
    matchesAll = smallerArray.every(elem => largerArray.indexOf(elem) !== -1);
    return matchesAll;
  },
  filterByUrlParams: () => {
    const searchQuery = window.location.search.split('=')[0];
    const searchParam = window.location.search.split('=')[1];

    switch (searchQuery) {
      case '?q':
        ListFilter.searchString = decodeURI(searchParam);
        ListFilter.projectList.search(ListFilter.searchString);
        ListFilter.displayResultQueries();
        break;
      case '?type':
        $(`input[type=checkbox][value=${searchParam}]`).prop('checked', true);
        ListFilter.activeTag = searchParam;
        ListFilter.mapCheckBoxes();
        break;
      default:
    }
  },
  clearAllFilters: () => {
    $('.clear_filters').on('click', e => {
      e.preventDefault();
      ListFilter.searchString = '';
      ListFilter.location = '';
      ListFilter.searchQueries = { software: 'all', hardware: 'all' };
      ListFilter.projectList.search();
      ListFilter.projectList.filter();
      ListFilter.projectList.sort('name', { order: 'asc' });

      if (window.location.search !== '') {
        window.location.href = window.location.origin + '/list.html';
      }

      ListFilter.clearFormInputs();
      ListFilter.displayResults();
      ListFilter.displayResultQueries();
    });
  },
  clearFormInputs: () => {
    $('.search__input').val('');
    $('.dropdown').prop('selectedIndex', 0);
    $('.country-dropdown').prop('selectedIndex', 0);
    $('input[type="checkbox"]:checked').prop('checked', false);
  },
  displayResults: () => {
    const projectCount = $('.project').length;
    $('.results-count').html(`<p>Displaying ${projectCount} Projects</p>`);
  },
  displayResultQueries: () => {
    const activeSearchParams = [];

    if (ListFilter.searchString !== '') {
      activeSearchParams.push(ListFilter.searchString);
    }

    $('input[type="checkbox"]:checked').each((val, item) => activeSearchParams.push(item.id));

    $('.dropdown').map((val, item) => {
      if (item.value !== 'Select one') {
        activeSearchParams.push(item.value);
      }
      return activeSearchParams;
    });

    $('.country-dropdown').map((val, item) => {
      if (item.value !== 'Country') {
        activeSearchParams.push(item.value);
      }
    })

    if (activeSearchParams.length > 0) {
      $('.results-message').show();
      if ($('.project').length === 0) {
        $('.results-message').html(`<p>No results for: ${activeSearchParams.join('; ')}</p>`);
      } else {
        $('.results-message').html(`<p>Results: ${activeSearchParams.join('; ')}</p>`);
      }
    } else {
      $('.results-message').hide();
    }
  },
  checkBox() {
    $(`input[type=checkbox][value=${ListFilter.activeTag}]`).prop('checked', true);
  },
  init() {
    this.createList();
    this.filterBySearch();
    this.filterByDropdowns();
    this.filterByLocation();
    this.filterByCheckboxes();
    this.filterByUrlParams();
    this.clearAllFilters();
    this.clearFormInputs();
    this.displayResults();
    this.checkBox();
  }
};

module.exports = ListFilter;
