import Component from './component.js';
import store from '../store/index.js';
import {CLAUSES, CLAUSES_TYPES} from "../const";
import Clause from "./Clause";
import Value from "./Value";
import {Sortable} from '@shopify/draggable';

export default class InputList extends Component {

    constructor() {
        super({
            store,
            element: document.querySelector('#sqlqb-input-container')
        });
    }

    render() {
        if (store.state.items.length === 0) {
            this.element.innerHTML = `<p class="no-items">You've done nothing yet &#x1f622;</p>`;
            return;
        }

        this.element.innerHTML = `
          <ul id="sqlqb-input">
            ${this.generateItems()}
          </ul>`;

        this.element.querySelectorAll('.sqlqb-tag-controls-remove').forEach((button, index) => {
            button.addEventListener('click', function () {
                store.dispatch('removeItem', index);
            });
        });

        this.initSortable();
    }

    generateItems() {
        return store.state.items.map(item => {
            if (item.type === CLAUSES_TYPES.VALUE) {
                let value = new Value(item);
                return value.generator();
            } else {
                let tag = new Clause(item);
                return tag.generator();
            }
        }).join('').trim();
    }

    initSortable() {
        const sortable_input = document.querySelector('#sqlqb-input');

        const sortable = new Sortable(sortable_input, {
            draggable: 'li',
            delay: 200,
        });
        sortable.on('sortable:stop', () => {
            setTimeout(()=> {
                store.dispatch('setInput', [...sortable_input.querySelectorAll('li')].map(item => {

                        let span = item.querySelector('span.sqlqb-tag');
                        let value = span.innerText.trim();
                        let id = item.getAttribute('data-clause-id');

                        return {
                            id: id,
                            type: CLAUSES[id].type,
                            block: CLAUSES[id].block,
                            name: CLAUSES[id].name,
                            value: value,
                        };
                    }
                ));
            }, 200);
        });
        sortable.on('sortable:start', (event) => event.data.dragEvent.mirror.classList.remove('sqlqb-animation-pulse'));
    }
}