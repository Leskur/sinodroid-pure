import React from "react";

interface AppIconProps {
  package: string;
  size?: number;
}

/**
 * 应用图标组件
 * 根据包名生成颜色和图标
 */
const AppIcon: React.FC<AppIconProps> = ({ package: pkg, size = 40 }) => {
  // 根据包名生成一致的颜色
  const getColorFromPackage = (packageName: string): string => {
    const hash = packageName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  // 提取包名的首字母或关键词
  const getIconText = (packageName: string): string => {
    const lowerPkg = packageName.toLowerCase();

    // 特殊处理小米/MIUI 相关
    if (lowerPkg.includes('miui')) {
      return 'MUI';
    }
    if (lowerPkg.includes('xiaomi')) {
      return 'MI';
    }

    // 其他品牌关键词
    const brands = ['huawei', 'oppo', 'vivo', 'google', 'android'];
    for (const brand of brands) {
      if (lowerPkg.includes(brand)) {
        return brand.substring(0, 2).toUpperCase();
      }
    }

    // 提取最后一个点后的内容
    const parts = packageName.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart.substring(0, 2).toUpperCase();
  };

  const bgColor = getColorFromPackage(pkg);
  const iconText = getIconText(pkg);

  return (
    <div
      className="app-icon"
      style={{
        width: size,
        height: size,
        background: bgColor,
        borderRadius: size * 0.2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: `${size * 0.35}px`,
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      {iconText}
    </div>
  );
};

export default AppIcon;
