# Artworks DataTable

A React TypeScript application that displays artwork data from the Art Institute of Chicago API with server-side pagination and persistent row selection.

## Overview

This project implements a data table that displays artwork information with the following key requirements:
- **Server-side pagination** - fetches data page by page from the API
- **Persistent selection** - maintains row selection across page navigation
- **Custom bulk selection** - allows selecting N rows across multiple pages without prefetching
- **No data prefetching** - only current page data is stored in memory

## Technologies Used

- **React 19** with TypeScript
- **Vite** - Build tool and development server
- **PrimeReact** - DataTable component library
- **PrimeIcons** - Icon library

## Approach & Architecture

### 1. Server-Side Pagination

The application fetches data on-demand for each page:
- API endpoint is configured via `.env` file
- Only the current page's data (12 rows) is loaded at a time
- Total records count is maintained for pagination controls
- No caching or prefetching of other pages

### 2. Persistent Selection Strategy

Selection is managed using two state variables:
- `selectedIds: Set<number>` - IDs of explicitly selected rows
- `deselectedIds: Set<number>` - IDs of explicitly deselected rows
- `selectTarget: number` - Target count when bulk selecting N rows

**How it works:**
- Individual selections add/remove IDs from `selectedIds`
- When user enters N in custom selection overlay, it sets `selectTarget = N`
- As pages load, rows are auto-selected until `selectedIds.size` reaches `selectTarget`
- Manual deselection adds IDs to `deselectedIds` to prevent auto-reselection
- Selection persists when navigating between pages

**Key Benefits:**
- No need to store row objects or fetch other pages
- Selection state is maintained purely via IDs
- Memory efficient - only tracks IDs, not full data

### 3. Component Structure

```
src/
├── components/
│   ├── ArtworksTable.tsx      # Main table component with selection logic
│   └── SelectionOverlay.tsx   # Custom N-row selection dialog
├── types/
│   └── artwork.ts             # TypeScript interface for artwork data
├── App.tsx                     # Root component
└── App.css                     # Custom styles
```

### 4. Key Features Implementation

#### Custom Row Selection Overlay
- Small dropdown icon positioned next to select-all checkbox
- Allows entering number of rows to select across all pages
- Auto-selects rows as user navigates pages until target is reached

#### N/A Display
- All empty or null field values display as "N/A"
- Consistent data presentation across all columns

#### Full-Page Loading
- Loading spinner overlays entire page during API calls
- Prevents interaction while data is being fetched

#### Footer Display
- Shows "Showing X to Y of Z entries" on the left
- Pagination controls (Previous, page numbers, Next) on the right


## Design Decisions

### No Prefetching
The implementation strictly avoids:
- Fetching multiple pages in advance
- Storing row data from other pages
- Making multiple API calls when selecting N rows

### ID-Based Selection
Instead of storing objects:
- Only row IDs are tracked in Sets
- Minimal memory footprint
- Fast lookup and updates

### Progressive Selection
When selecting N rows across pages:
- Selects from current page first
- Auto-selects on subsequent pages until target reached
- User can manually override selection on any page
- No automatic refill after manual deselection
