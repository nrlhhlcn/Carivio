export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)'}}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
        <span className="text-sm text-gray-500">Yükleniyor…</span>
      </div>
    </div>
  )
}


