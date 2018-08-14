//= require ./lib/_energize
//= require ./app/_toc
//= require ./app/_lang

$(function() {
  loadToc($('#toc'), '.toc-link', '.toc-list-h2', 10);
  setupLanguages($('body').data('languages'));
  $('.content').imagesLoaded(function() {
    window.recacheHeights();
    window.refreshToc();
  });
});

window.onpopstate = function() {
  activateLanguage(getLanguageFromQueryString());
};

$(function() {
  $('#toc').on('click', '.toc-link', function() {
    console.log(event.target.href);
    console.log( this.href );
    // $('html, body').animate(
    //   {
    //     scrollTop: window.innerHeight
    //   },
    //   800
    // );
  });
});