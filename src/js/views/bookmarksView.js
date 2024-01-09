import View from "./View";
import previewView from "./previewView.js";

class BookMarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = 'No bookmarks yet.';
  _successMessage = '';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    return this._data.map(bookmark => previewView.render(bookmark, false)).join('')
  };

}

export default new BookMarksView();

