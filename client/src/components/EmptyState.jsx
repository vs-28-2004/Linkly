import React from 'react'

/** Friendly "nothing here" / "something went wrong" box. */
const EmptyState = ({ icon: Icon, title, children, action }) => (
  <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-10 text-center">
    {Icon && (
      <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon className="h-6 w-6" />
      </span>
    )}
    <p className="font-semibold text-stone-800">{title}</p>
    {children && <p className="max-w-sm text-sm text-stone-500">{children}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
)

export default EmptyState
