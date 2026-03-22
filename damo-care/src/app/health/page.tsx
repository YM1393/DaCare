export default function HealthPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">산모 건강</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-green-500">산후 우울증</h2>
          <p className="mt-2 text-gray-600">
            산후 우울증의 증상, 원인, 그리고 극복 방법에 대해 알아보세요. 혼자가 아닙니다.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-green-500">산후 영양 관리</h2>
          <p className="mt-2 text-gray-600">
            출산 후 필요한 영양소를 골고루 섭취하고 건강을 관리하는 방법을 알려드립니다.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-green-500">일상으로의 복귀</h2>
          <p className="mt-2 text-gray-600">
            부부 관계, 직장 생활 등 출산 후 일상으로 건강하게 복귀하기 위한 팁을 공유합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
