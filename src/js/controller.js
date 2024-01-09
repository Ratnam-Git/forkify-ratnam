import * as model from './model.js'
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime'
import { MODAL_CLOSE_SEC } from './config.js';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    //extracting ID from url
    const id = window.location.hash.slice(1);
    if (!id) return
    recipeView.renderSpinner();

    //update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //loading recipe
    await model.loadRecipe(id);

    //rendering the recipe
    recipeView.render(model.state.recipe);

    //updating bookmarks view
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
  }

};


const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    const searchQuery = searchView.getQuery();
    if (!searchQuery) throw new Error('No recipes found!');

    await model.loadSearchResults(searchQuery);

    // resultsView.render(model.state.search.results);
    //printing page wise
    resultsView.render(model.getSearchResultsPage());

    //render initial pagination buttons
    paginationView.render(model.state.search);

  } catch (error) {
    resultsView.renderError(error);
  }
};


const controlPagination = function (goToPage) {
  //render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //render new pagination buttons
  paginationView.render(model.state.search);
}

const controlServings = function (newServings) {
  //update the recipe servings(in state)
  model.updateServings(newServings);
  //update recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe); //will only update text and elements in the DOM
};


const controlAddBookmark = function () {
  //add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //update recipe view
  recipeView.update(model.state.recipe);

  //render the bookmark
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
}

//get form data from recipeView
const controlAddRecipe = async function (newRecipe) {
  try {
    //loading spinner
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);

    //render recipe
    recipeView.render(model.state.recipe);

    //success message
    addRecipeView.renderMessage();

    //rerender bookmarks
    bookmarksView.render(model.state.bookmarks);

    //change ID into URL
    //using history.pushState() of browser API
    //takes 3 arg: 1-> state, 2->titles, 3->url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form
    setTimeout(function () {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000);
  }
  catch (err) {
    console.error('💥💥', err);
    addRecipeView.renderError(err.message);
  }

}

//using the publisher-subscriber model for event handlers
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();

