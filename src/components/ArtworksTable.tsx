import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { OverlayPanel } from 'primereact/overlaypanel'
import type { Artwork } from '../types/artwork'
import SelectionOverlay from './SelectionOverlay'

interface ApiResponse {
  pagination: {
    total: number
    limit: number
    offset: number
    total_pages: number
    current_page: number
  }
  data: Artwork[]
}

export default function ArtworksTable() {
  const [data, setData] = useState<Artwork[]>([])
  const [page, setPage] = useState(1)
  const [rowsPerPage] = useState(12)
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set())
  const [selectTarget, setSelectTarget] = useState(0)
  
  const overlayRef = useRef<OverlayPanel>(null)

  useEffect(() => {
    fetchData(page)
  }, [page])

  const fetchData = async (pageNumber: number) => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}?page=${pageNumber}`)
      const result: ApiResponse = await response.json()
      setData(result.data)
      setTotalRecords(result.pagination.total)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const onPageChange = (event: any) => {
    setPage(event.page + 1)
  }

  const isRowSelected = (rowId: number): boolean => {
    return selectedIds.has(rowId)
  }

  const getSelectedRows = (): Artwork[] => {
    return data.filter(row => isRowSelected(row.id))
  }

  const onSelectionChange = (e: any) => {
    const newSelection: Artwork[] = e.value
    const currentPageIds = new Set(data.map(row => row.id))
    
    const newSelectedIds = new Set(selectedIds)
    const newDeselectedIds = new Set(deselectedIds)

    // Update based on current page only
    currentPageIds.forEach(id => {
      const isInNewSelection = newSelection.some(row => row.id === id)
      if (isInNewSelection) {
        newSelectedIds.add(id)
        newDeselectedIds.delete(id)
      } else {
        newSelectedIds.delete(id)
        newDeselectedIds.add(id)
      }
    })

    setSelectedIds(newSelectedIds)
    setDeselectedIds(newDeselectedIds)
  }

  const onSelectAllChange = (e: any) => {
    const pageIds = data.map(r => r.id)
    if (e.checked) {
      const ns = new Set(selectedIds)
      const nd = new Set(deselectedIds)
      pageIds.forEach(id => { ns.add(id); nd.delete(id) })
      setSelectedIds(ns)
      setDeselectedIds(nd)
    } else {
      const ns = new Set(selectedIds)
      const nd = new Set(deselectedIds)
      pageIds.forEach(id => { ns.delete(id); nd.add(id) })
      setSelectedIds(ns)
      setDeselectedIds(nd)
    }
  }

  const isAllSelected = (): boolean => {
    return data.every(row => isRowSelected(row.id))
  }

  const fillFromPage = (incoming: Artwork[], ns: Set<number>, nd: Set<number>, target: number) => {
    for (const row of incoming) {
      if (ns.size >= target) break
      if (nd.has(row.id)) continue
      if (!ns.has(row.id)) ns.add(row.id)
    }
  }

  const handleCustomSelection = (count: number) => {
    setSelectTarget(count)
    const ns = new Set<number>()
    const nd = new Set<number>()
    fillFromPage(data, ns, nd, count)
    setSelectedIds(ns)
    setDeselectedIds(nd)
  }

  useEffect(() => {
    if (selectTarget > 0 && selectedIds.size < selectTarget) {
      const ns = new Set(selectedIds)
      const nd = new Set(deselectedIds)
      fillFromPage(data, ns, nd, selectTarget)
      if (ns.size !== selectedIds.size) {
        setSelectedIds(ns)
        setDeselectedIds(nd)
      }
    }
  }, [data])

  const getSelectionCount = (): number => {
    if (selectTarget > 0 && selectTarget > selectedIds.size) {
      return selectTarget
    }
    return selectedIds.size
  }

  const renderField = (rowData: Artwork, field: keyof Artwork) => {
    const value = rowData[field]
    return value || 'N/A'
  }

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <i className="pi pi-spinner pi-spin" style={{ fontSize: '2rem', color: '#5e72e4' }} />
        </div>
      )}

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#6c757d' }}>Selected: {getSelectionCount()} rows</span>
      </div>

      <SelectionOverlay overlayRef={overlayRef} onApply={handleCustomSelection} />

      <div style={{ position: 'relative' }}>
        <button
          className="overlay-trigger-absolute"
          onClick={(e) => overlayRef.current?.toggle(e)}
          type="button"
        >
          <i className="pi pi-chevron-down" />
        </button>

        <DataTable
          value={data}
          lazy
          paginator
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPage={onPageChange}
          first={(page - 1) * rowsPerPage}
          loading={false}
          selection={getSelectedRows()}
          onSelectionChange={onSelectionChange}
          dataKey="id"
          selectAll={isAllSelected()}
          onSelectAllChange={onSelectAllChange}
          selectionMode="multiple"
          tableStyle={{ minWidth: '50rem' }}
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
          <Column
            field="title"
            header="TITLE"
            body={(rowData) => renderField(rowData, 'title')}
          />
        <Column field="place_of_origin" header="PLACE OF ORIGIN" body={(rowData) => renderField(rowData, 'place_of_origin')} />
        <Column field="artist_display" header="ARTIST" body={(rowData) => renderField(rowData, 'artist_display')} />
        <Column field="inscriptions" header="INSCRIPTIONS" body={(rowData) => renderField(rowData, 'inscriptions')} />
        <Column field="date_start" header="START DATE" body={(rowData) => renderField(rowData, 'date_start')} />
        <Column field="date_end" header="END DATE" body={(rowData) => renderField(rowData, 'date_end')} />
      </DataTable>
      </div>
    </div>
  )
}
