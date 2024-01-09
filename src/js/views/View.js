import icons from 'url:../../img/icons.svg';

export default class View {


  _data;
  render(data, render = true) {
    this._data = data;
    const markup = this._generateMarkup();
    if (!render) return markup;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }

  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup); //this will convert string into DOM node objects(a virtual DOM)
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    // console.log(newElements);
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));
    // console.log(curElements);
    // console.log(newElements);

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      //compare two elements by using isEqualNode()
      // console.log(curEl, newEl.isEqualNode(curEl));

      //change text values
      if (!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue?.trim() !== '') {
        //incase of values other than text, nodeValue returns an empty string
        curEl.textContent = newEl.textContent;
      }

      //change element attributes
      if (!newEl.isEqualNode(curEl)) {
        //using attributes property of an element
        // console.log(newEl.attributes);
        Array.from(newEl.attributes).forEach(attr => curEl.setAttribute(attr.name, attr.value));
      }
    })
  }

  renderSpinner() {
    const markup = `<div class="spinner">
          <svg>
            <use href="${icons}#icon-loader"></use>
          </svg>
        </div>`;
    this._parentElement.innerHTML = '';
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  };

  renderError(message = this._errorMessage) {
    const markup = `<div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>`;
    this._parentElement.innerHTML = '';
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderMessage(message = this._message) {
    console.log(message);
    const markup = `<div class="message">
            <div>
              <svg>
                <use href="${icons}#icon-smile"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>`;
    this._parentElement.innerHTML = '';
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}