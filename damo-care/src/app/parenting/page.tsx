export default function ParentingPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">육아 정보</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-blue-500">신생아 돌보기</h2>
          <p className="mt-2 text-gray-600">
            기저귀 갈기, 목욕시키기 등 신생아를 돌보는 기본적인 방법을 알려드립니다.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-blue-500">모유 수유 가이드</h2>
          <p className="mt-2 text-gray-600">
            성공적인 모유 수유를 위한 자세, 팁, 그리고 어려움 해결 방법을 공유합니다.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-blue-500">육아용품 추천</h2>
          <p className="mt-2 text-gray-600">
            선배 엄마들이 추천하는 필수 육아용품 리스트와 사용 후기를 확인해보세요.
          </p>
        </div>
      </div>
    </div>
  );
}
