function ProductFilters({ categorias, filtros, onChange, onClear }) {
  const set = (campo, valor) => onChange({ ...filtros, [campo]: valor })

  const hayFiltros =
    filtros.q || filtros.categoria || filtros.precioMin || filtros.precioMax || filtros.disponible

  return (
    <form
      className="card p-3 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault()
        onChange({ ...filtros })
      }}
    >
      <h6 className="fw-bold">Filtros</h6>

      <div className="mb-3">
        <label className="form-label small" htmlFor="filtro-busqueda">
          Nombre
        </label>
        <input
          id="filtro-busqueda"
          type="text"
          className="form-control"
          placeholder="Buscar por nombre..."
          value={filtros.q || ''}
          onChange={(e) => set('q', e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label small" htmlFor="filtro-categoria">
          Categoría
        </label>
        <select
          id="filtro-categoria"
          className="form-select"
          value={filtros.categoria || ''}
          onChange={(e) => set('categoria', e.target.value)}
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-6">
          <label className="form-label small" htmlFor="filtro-min">
            Precio mínimo
          </label>
          <input
            id="filtro-min"
            type="number"
            min="0"
            step="0.01"
            className="form-control"
            placeholder="0"
            value={filtros.precioMin || ''}
            onChange={(e) => set('precioMin', e.target.value)}
          />
        </div>
        <div className="col-6">
          <label className="form-label small" htmlFor="filtro-max">
            Precio máximo
          </label>
          <input
            id="filtro-max"
            type="number"
            min="0"
            step="0.01"
            className="form-control"
            placeholder="5000"
            value={filtros.precioMax || ''}
            onChange={(e) => set('precioMax', e.target.value)}
          />
        </div>
      </div>

      <div className="form-check mb-3">
        <input
          id="filtro-disponible"
          type="checkbox"
          className="form-check-input"
          checked={filtros.disponible === 'true'}
          onChange={(e) => set('disponible', e.target.checked ? 'true' : '')}
        />
        <label className="form-check-label small" htmlFor="filtro-disponible">
          Solo productos disponibles
        </label>
      </div>

      <button type="submit" className="btn btn-primary w-100 mb-2">
        Aplicar filtros
      </button>
      {hayFiltros && (
        <button type="button" className="btn btn-outline-secondary w-100" onClick={onClear}>
          Limpiar filtros
        </button>
      )}
    </form>
  )
}

export default ProductFilters
