/**
 * SVG Shape Renderer for Abstract Reasoning questions.
 * Renders geometric shapes from JSON descriptors.
 */

const SIZES = { small: 20, medium: 32, large: 44 };

function getShapePath(type, size) {
  const s = size;
  const h = s / 2;
  switch (type) {
    case 'circle':
      return <circle cx={h} cy={h} r={h - 2} />;
    case 'square':
      return <rect x={2} y={2} width={s - 4} height={s - 4} />;
    case 'triangle':
      return <polygon points={`${h},2 ${s - 2},${s - 2} 2,${s - 2}`} />;
    case 'diamond':
      return <polygon points={`${h},2 ${s - 2},${h} ${h},${s - 2} 2,${h}`} />;
    case 'hexagon': {
      const r = h - 2;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        return `${h + r * Math.cos(angle)},${h + r * Math.sin(angle)}`;
      }).join(' ');
      return <polygon points={pts} />;
    }
    case 'star': {
      const outer = h - 2;
      const inner = outer * 0.4;
      const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? outer : inner;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        return `${h + r * Math.cos(angle)},${h + r * Math.sin(angle)}`;
      }).join(' ');
      return <polygon points={pts} />;
    }
    case 'cross':
      return (
        <path
          d={`M${h - s * 0.15},2 h${s * 0.3} v${h - s * 0.15 - 2} h${h - s * 0.15 - 2} v${s * 0.3} h-${h - s * 0.15 - 2} v${h - s * 0.15 - 2} h-${s * 0.3} v-${h - s * 0.15 - 2} h-${h - s * 0.15 - 2} v-${s * 0.3} h${h - s * 0.15 - 2} z`}
        />
      );
    case 'arrow':
      return (
        <polygon
          points={`${h},2 ${s - 2},${h} ${h + s * 0.15},${h} ${h + s * 0.15},${s - 2} ${h - s * 0.15},${s - 2} ${h - s * 0.15},${h} 2,${h}`}
        />
      );
    default:
      return <circle cx={h} cy={h} r={h - 2} />;
  }
}

export default function ShapeRenderer({ shape, className = '' }) {
  if (!shape) return null;

  const size = SIZES[shape.size] || SIZES.medium;
  const fill = shape.fill || '#003399';
  const stroke = shape.stroke || 'none';
  const rotation = shape.rotation || 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
    >
      <g fill={fill} stroke={stroke} strokeWidth={stroke !== 'none' ? 1.5 : 0}>
        {getShapePath(shape.type, size)}
      </g>
    </svg>
  );
}

export function ShapeSequence({ shapes, className = '' }) {
  if (!shapes || !shapes.length) return null;

  return (
    <div className={`flex items-center justify-center gap-3 flex-wrap ${className}`}>
      {shapes.map((shape, i) => (
        <div key={i} className="flex items-center gap-2">
          <ShapeRenderer shape={shape} />
          {i < shapes.length - 1 && (
            <span className="text-gray-400 dark:text-gray-500 text-lg select-none">&rarr;</span>
          )}
        </div>
      ))}
      <span className="text-gray-400 dark:text-gray-500 text-2xl font-bold select-none">&rarr; ?</span>
    </div>
  );
}

export function ShapeMatrix({ matrix, className = '' }) {
  if (!matrix || !matrix.length) return null;

  return (
    <div className={`inline-grid grid-cols-3 gap-1 ${className}`}>
      {matrix.flat().map((cell, i) => (
        <div
          key={i}
          className="flex items-center justify-center w-16 h-16 border-2 border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg"
        >
          {cell ? (
            <ShapeRenderer shape={cell} />
          ) : (
            <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 select-none">?</span>
          )}
        </div>
      ))}
    </div>
  );
}
