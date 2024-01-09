import { API_URL, RES_PER_PAGE, KEY } from "./config.js";
// import { getJson, sendJson } from "./helpers.js";
import { AJAX } from "./helpers.js";

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE
    },
    bookmarks: [],
};

//loading a recipe

const createRecipeObject = function (data) {
    const { recipe } = data.data;
    return state.recipe = {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && { key: recipe.key }), //trick to conditionally add values in object
    };
}

export const loadRecipe = async function (id) {
    try {

        //loading recipe
        const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);

        state.recipe = createRecipeObject(data);

        if (state.bookmarks.some(bookmark => bookmark.id === id)) {
            state.recipe.bookmarked = true;
        }
        else state.recipe.bookmarked = false;

    } catch (err) {
        console.error(`${err} 💥💥💥`);
        throw err;
    }
};

//searching recipe

export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;

        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
        // console.log(data.data.recipes);

        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && { key: rec.key })
            }
        });

        state.search.page = 1;

    } catch (error) {
        console.error(`{err} 💥💥💥`);
        throw err;
    }
};


export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;

    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;

    return state.search.results.slice(start, end); //end is not included
}

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
        //newQt = oldQt * newServings /oldServings //-> 2 * 8 /4 = 4
    });

    state.recipe.servings = newServings;
};

const persistBookmarks = function (bookmarks) {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = function (recipe) {
    //add bookmark
    state.bookmarks.push(recipe);

    //mark current recipe as bookmark
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    persistBookmarks();
};

export const deleteBookmark = function (id) {
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);

    //mark current recipe as NOT bookmark
    if (state.recipe.id === state.recipe.id) state.recipe.bookmarked = false;

    persistBookmarks();
}

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
}

init();

// const clearBookmarks = function () {
//     localStorage.clear('bookmarks');
// };
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient') && entry[1] !== "")
            .map(ing => {
                const ingArr = ing[1].split(',').map(el => el.trim());
                // const ingArr = ing[1].replaceAll(' ', '').split(',');
                if (ingArr.length !== 3) throw new Error('Wrong ingredient format')
                const [quantity, unit, description] = ingArr;
                return { quantity: quantity ? +quantity : null, unit, description };
            });

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            publisher: newRecipe.publisher,
            ingredients,
        }
        // console.log(recipe);

        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        // console.log(data);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe)
        console.log(state.recipe);
    }
    catch (err) {
        throw err;
    }
}