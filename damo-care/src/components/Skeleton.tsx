export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-3xl overflow-hidden border border-gray-100">
      <div className="h-48 bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-gray-200 rounded-xl w-3/4" />
        <div className="h-4 bg-gray-200 rounded-xl w-1/2" />
        <div className="h-4 bg-gray-200 rounded-xl w-2/3" />
        <div className="h-10 bg-gray-100 rounded-xl mt-4" />
      </div>
    </div>
  );
}

export function SkeletonPost() {
  return (
    <div className="animate-pulse bg-white rounded-3xl p-7 border border-gray-100">
      <div className="h-3 bg-gray-200 rounded-full w-16 mb-4" />
      <div className="h-5 bg-gray-200 rounded-xl w-3/4 mb-3" />
      <div className="h-3 bg-gray-200 rounded-xl w-full mb-2" />
      <div className="h-3 bg-gray-200 rounded-xl w-2/3" />
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-32 bg-gray-200 rounded-3xl" />
      <div className="h-4 bg-gray-200 rounded-xl w-1/2 mx-auto" />
      <div className="h-4 bg-gray-200 rounded-xl w-1/3 mx-auto" />
    </div>
  );
}
