import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // react-icons 등 대형 패키지 트리쉐이킹 최적화 (번들 크기 대폭 감소)
    optimizePackageImports: [
      'react-icons/fi',
      'react-icons/fa',
      'react-icons/md',
      'react-icons/hi',
      'react-icons/bs',
      'react-icons/io',
    ],
  },
  // 응답 압축 활성화
  compress: true,
  // 빌드 시 소스맵 제거 (프로덕션 번들 경량화)
  productionBrowserSourceMaps: false,
};

export default nextConfig;
