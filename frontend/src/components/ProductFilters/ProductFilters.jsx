import { useStore } from '../../context/StoreContext';
import './ProductFilters.css';

const TYPES = [
  { value: 'ready-made', label: 'Ready-made' },
  { value: 'made-to-order', label: 'Made to order' },
  { value: 'custom', label: 'Custom' },
];

/** Sidebar filters. `values` mirrors URL search params; `onChange(key, value)` updates one. */
const ProductFilters = ({ values, onChange, onReset, options = { occasions: [], colors: [] }, hideCategory = false }) => {
  const { categories } = useStore();

  // Plain function (not a component) so inputs are not remounted on every render
  const Radio = ({ name, value, label }) => (
    <label className="filters__option" key={`${name}-${value}`}>
      <input type="radio" name={name} checked={(values[name] || '') === value} onChange={() => onChange(name, value)} />
      {label}
    </label>
  );

  return (
    <aside className="filters" aria-label="Product filters">
      <div className="filters__head">
        <h3>Filters</h3>
        <button type="button" onClick={onReset}>Clear all</button>
      </div>

      {!hideCategory && (
        <fieldset className="filters__group">
          <legend>Category</legend>
          {Radio({ name: "category", value: "", label: "All" })}
          {categories.map((c) => (
            Radio({ name: "category", value: c.slug, label: c.name })
          ))}
        </fieldset>
      )}

      <fieldset className="filters__group">
        <legend>Price (Rs.)</legend>
        <div className="filters__price">
          <input className="input" type="number" min="0" placeholder="Min" value={values.minPrice || ''} onChange={(e) => onChange('minPrice', e.target.value)} aria-label="Minimum price" />
          <span>–</span>
          <input className="input" type="number" min="0" placeholder="Max" value={values.maxPrice || ''} onChange={(e) => onChange('maxPrice', e.target.value)} aria-label="Maximum price" />
        </div>
      </fieldset>

      <fieldset className="filters__group">
        <legend>Availability</legend>
        {Radio({ name: "availability", value: "", label: "Any" })}
        {Radio({ name: "availability", value: "in-stock", label: "Available" })}
        {Radio({ name: "availability", value: "out-of-stock", label: "Out of stock" })}
      </fieldset>

      <fieldset className="filters__group">
        <legend>Type</legend>
        {Radio({ name: "type", value: "", label: "All types" })}
        {TYPES.map((t) => (
          Radio({ name: "type", value: t.value, label: t.label })
        ))}
      </fieldset>

      {options.occasions.length > 0 && (
        <fieldset className="filters__group">
          <legend>Occasion</legend>
          <select className="select" value={values.occasion || ''} onChange={(e) => onChange('occasion', e.target.value)} aria-label="Occasion">
            <option value="">Any occasion</option>
            {options.occasions.map((o) => <option key={o}>{o}</option>)}
          </select>
        </fieldset>
      )}

      {options.colors.length > 0 && (
        <fieldset className="filters__group">
          <legend>Colour</legend>
          <div className="filters__chips">
            {options.colors.map((c) => (
              <button
                type="button"
                key={c}
                className={`filters__chip ${values.color === c ? 'is-active' : ''}`}
                onClick={() => onChange('color', values.color === c ? '' : c)}
                aria-pressed={values.color === c}
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </aside>
  );
};

export default ProductFilters;
