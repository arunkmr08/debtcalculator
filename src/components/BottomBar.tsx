import React from 'react'

export function BottomBar({
  onExportCSV,
  onPrint,
  onUndo,
}: {
  onExportCSV: () => void
  onPrint: () => void
  onUndo: () => void
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 no-print z-30">
      <div className="w-full p-3">
        <div className="w-full rounded-none bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)] ring-1 ring-gray-200 p-2 flex justify-end gap-2">
          <button onClick={onExportCSV} className="rounded-xl px-3 py-2 bg-gray-100 ring-1 ring-gray-200 hover:bg-gray-200">Export</button>
          <button onClick={onPrint} className="rounded-xl px-3 py-2 bg-gray-100 ring-1 ring-gray-200 hover:bg-gray-200">Print PDF</button>
          <button onClick={onUndo} className="rounded-xl px-3 py-2 bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100">Undo</button>
        </div>
      </div>
    </div>
  )
}